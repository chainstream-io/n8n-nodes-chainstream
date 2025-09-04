import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';
import { tokenFields, tokenOperations } from './TokenDescription';
import { chainstreamApiRequest } from './GenericFunctions';

export class Chainstream implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chainstream',
		name: 'chainstream',
		icon: 'file:chainstream.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Chainstream API',
		defaults: {
			name: 'Chainstream',
		},
		// @ts-ignore - node-class-description-outputs-wrong
		inputs: [{ type: NodeConnectionType.Main }],
		// @ts-ignore - node-class-description-outputs-wrong
		outputs: [{ type: NodeConnectionType.Main }],
		usableAsTool: true,
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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Token',
						value: 'token',
					},
					{
						name: 'Dex',
						value: 'dex',
					},
				],
				default: 'token',
			},
			...tokenOperations,
			...tokenFields,
		],
	};

	methods = {
		loadOptions: {
			async getChains(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const response = await chainstreamApiRequest.call(
					this,
					'GET',
					'blockchain',
				);

				for (const chainId of response) {
					returnData.push({
						name: chainId,
						value: chainId,
					});
				}
				return returnData;
			}
		}
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let responseData;
		const qs: IDataObject = {};
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

	
		for (let i = 0; i < length; i++) {
			try {
				if (resource === 'token') {
					if (operation === 'get') {
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}`, {});
						responseData = responseData;
					} else if (operation === 'getMany') {
						const chainId = this.getNodeParameter("chainId", i) as string;
						qs.tokenAddresses = this.getNodeParameter('tokenAddresses', i) as string;

						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/multi`, {}, qs);
						responseData = responseData;
					} else if (operation === 'search') {
						const chains = this.getNodeParameter("chains", i) as string;
						qs.chains = chains;
						qs.q = this.getNodeParameter('q', i) as string;
						qs.limit = this.getNodeParameter('limit', i);

						responseData = await chainstreamApiRequest.call(this, 'GET', `token/search`, {}, qs);
						responseData = responseData;
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch(error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
