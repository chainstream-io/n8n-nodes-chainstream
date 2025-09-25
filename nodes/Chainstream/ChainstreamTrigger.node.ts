// import { createHmac } from 'crypto';
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
				default: 'sol.token.migrated',
				options: [
					{
						name: 'Token Migrated',
						value: 'sol.token.migrated',
					},
					{
						name: 'Token Created',
						value: 'sol.token.created',
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
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default');
				const endpoint = 'webhook/endpoint';

				const res = await chainstreamApiRequest.call(this, 'GET', endpoint);
				this.logger.debug('Chainstream node start checkExists method', { res });
				for (const webhook of res.data) {
					if (webhook.url === webhookUrl) {
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
				const endpoint = 'webhook/endpoint';
				const body = {
					filterTypes: [topic],
					url: webhookUrl,
					// format: 'json',
				};

				this.logger.debug('Chainstream node start create method', { body });
				const responseData = await chainstreamApiRequest.call(this, 'POST', endpoint, body);
				this.logger.debug('Chainstream node execute create method return result', { responseData });
				
				if (responseData === undefined || responseData.id === undefined) {
					// Required data is missing so was not successful
					return false;
				}

				webhookData.webhookId = responseData.id as string;
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.webhookId !== undefined) {
					const endpoint = `webhook/endpoint/${webhookData.webhookId}`;
					this.logger.debug('Chainstream node start delete method', { endpoint });
					try {
						await chainstreamApiRequest.call(this, 'DELETE', endpoint, {});
					} catch (error) {
						this.logger.error('Chainstream node execute delete method error', { error });
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
		
		try {
			const webhookData = this.getWorkflowStaticData('node');
			let secret = webhookData.secret as string;
			
			if (!secret) {
				try {
					const endpoint = `webhook/endpoint/${webhookData.webhookId}/secret`;
					const credentials = await this.getCredentials('chainstreamApi');
					const options = {
						method: 'GET' as const,
						uri: `${credentials.apiBaseUrl}/v1/${endpoint}`,
						headers: {
							'Authorization': `Bearer ${credentials.sessionToken}`,
						},
						json: true,
					};
					
					const response = await this.helpers.requestWithAuthentication.call(this, 'chainstreamApi', options);
					secret = response.secret;
					webhookData.secret = secret;
				} catch (error) {
					this.logger.warn('Failed to get webhook secret, proceeding without signature verification', { error });
					return {
						workflowData: [this.helpers.returnJsonArray(req.body as IDataObject)],
					};
				}
			}
			
			if (headerData['svix-signature'] !== undefined) {
				const { createHmac } = await import('crypto');
				
				const svixId = headerData['svix-id'] as string;
				const svixTimestamp = headerData['svix-timestamp'] as string;
				const svixSignature = headerData['svix-signature'] as string;
				
				const signedContent = `${svixId}.${svixTimestamp}.${req.rawBody}`;
				const secretBytes = Buffer.from(secret.split('_')[1], "base64");
				const computedSignature = createHmac('sha256', secretBytes)
					.update(signedContent)
					.digest('base64');

				const signatures = svixSignature.split(' ').map(sig => sig.split(',')[1]);
				const isValidSignature = signatures.some(sig => sig === computedSignature);

				if (!isValidSignature) {
					this.logger.warn('Webhook signature verification failed');
					return {};
				}

				const currentTime = Math.floor(Date.now() / 1000);
				const timestamp = parseInt(svixTimestamp);
				const timeDiff = Math.abs(currentTime - timestamp);
				
				if (timeDiff > 300) {
					this.logger.warn('Webhook timestamp too old', { timeDiff });
					return {};
				}
			} else {
				this.logger.warn('No signature header found in webhook request');
				return {};
			}

			this.logger.debug('Webhook signature verified successfully');
			return {
				workflowData: [this.helpers.returnJsonArray(req.body as IDataObject)],
			};
		} catch (error) {
			this.logger.error('Webhook verification failed', { error });
			return {};
		}
	}
}
