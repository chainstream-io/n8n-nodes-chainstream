import { createHmac } from 'crypto';
import {
	type IHookFunctions,
	type IWebhookFunctions,
	type IDataObject,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookResponseData,
	NodeConnectionType,
} from 'n8n-workflow';
import { chainstreamApiRequest } from './GenericFunctions';


export class ChainstreamTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chainstream Trigger',
		name: 'chainstreamTrigger',
		icon: 'file:chainstream.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Handle Chainstream events via webhooks',
		defaults: {
			name: 'Chainstream Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'chainstreamApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['apiKey'],
					},
				},
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'API Key',
						value: 'apiKey',
					},
				],
				default: 'apiKey',
			},
			{
				displayName: 'Trigger On',
				name: 'topic',
				type: 'options',
				default: 'token/migrated',
				options: [
					{
						name: 'Token Migrated',
						value: 'token/migrated',
					},
				],
			},
            {
                displayName: 'Filter',
                name: 'filter',
                type: 'string',
                default: '',
                typeOptions: {
                    rows: 4,
                },
                description: 'Filter the events to only include those that match the filter',
            },
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const topic = this.getNodeParameter('topic') as string;
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default');
				const endpoint = '/webhooks';

				const { webhooks } = await chainstreamApiRequest.call(this, 'GET', endpoint, {}, { topic });
				for (const webhook of webhooks) {
					if (webhook.address === webhookUrl) {
						webhookData.webhookId = webhook.id;
						return true;
					}
				}
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const topic = this.getNodeParameter('topic') as string;
				const webhookData = this.getWorkflowStaticData('node');
				const endpoint = '/webhooks.json';
				const body = {
					webhook: {
						topic,
						address: webhookUrl,
						format: 'json',
					},
				};

				const responseData = await chainstreamApiRequest.call(this, 'POST', endpoint, body);

				if (responseData.webhook === undefined || responseData.webhook.id === undefined) {
					// Required data is missing so was not successful
					return false;
				}

				webhookData.webhookId = responseData.webhook.id as string;
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.webhookId !== undefined) {
					const endpoint = `/webhooks/${webhookData.webhookId}.json`;
					try {
						await chainstreamApiRequest.call(this, 'DELETE', endpoint, {});
					} catch (error) {
						return false;
					}
					delete webhookData.webhookId;
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const headerData = this.getHeaderData() as IDataObject;
		const req = this.getRequestObject();
		const authentication = this.getNodeParameter('authentication') as string;
		let secret = '';

		if (authentication === 'apiKey') {
			const credentials = await this.getCredentials('chainstreamApi');
			secret = credentials.sharedSecret as string;
		}

		const topic = this.getNodeParameter('topic') as string;
		if (
			headerData['x-hmac-sha256'] !== undefined
		) {
			const computedSignature = createHmac('sha256', secret).update(req.rawBody).digest('base64');

			if (headerData['x-hmac-sha256'] !== computedSignature) {
				return {};
			}

            if (topic !== headerData['x-topic']) {
				return {};
			}
		} else {
			return {};
		}
		return {
			workflowData: [this.helpers.returnJsonArray(req.body as IDataObject)],
		};
	}
}
