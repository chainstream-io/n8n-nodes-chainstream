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
import { chainstreamApiRequest } from './GenericFunctions';
import { tokenFields, tokenOperations } from './TokenDescription';

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

	/*
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
	};*/

	methods = {
		loadOptions: {
			async getChains(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const response = await chainstreamApiRequest.call(this, 'GET', 'blockchain');

				if (!Array.isArray(response)) return returnData;

				for (const chain of response) {
					const displayName = (chain && (chain.name ?? chain.symbol ?? String(chain.chainId ?? ''))) as string;
					const value = chain && (chain.chainId ?? chain.id ?? chain.symbol ?? displayName);

					if (displayName == null) continue;

					returnData.push({
						name: displayName,
						value,
					});
				}

				return returnData;
			},
		},
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
					} else if (operation === 'getMany') {
						const chainId = this.getNodeParameter("chainId", i) as string;
						qs.tokenAddresses = this.getNodeParameter('tokenAddresses', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/multi`, {}, qs);
					} else if (operation === 'search') {
						const chains = this.getNodeParameter("chains", i) as string;
						qs.chains = chains;
						qs.q = this.getNodeParameter('q', i) as string;
						qs.limit = this.getNodeParameter('limit', i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/search`, {}, qs);
					} else if(operation === 'detail'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}`, {});
					} else if(operation === 'metadata'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/metadata`, {});
					} else if(operation === 'liquidity'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/liquidity`, {});
					} else if(operation === 'stats'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/stats`, {});
					} else if(operation === 'holders'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						qs.limit = this.getNodeParameter('limit', i) as number;
						qs.cursor = this.getNodeParameter('cursor', i) as string;
						qs.direction = this.getNodeParameter('direction', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/holders`, qs);
					} else if(operation === 'candles'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						qs.resolution = this.getNodeParameter('resolution', i) as string;
						qs.from = this.getNodeParameter('from', i) as number;
						qs.to = this.getNodeParameter('to', i) as number;
						qs.limit = this.getNodeParameter('limit', i) as number;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/candles`, qs);
					} else if(operation === 'topHolders'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/topHolders`, {});
					} else if(operation === 'marketData'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/marketData`, {});
					} else if(operation === 'prices'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						qs.cursor = this.getNodeParameter('cursor', i) as string;
						qs.direction = this.getNodeParameter('direction', i) as string;
						qs.limit = this.getNodeParameter('limit', i) as number;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/prices`, qs);
					} else if(operation === 'price'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						qs.timestamp = this.getNodeParameter('timestamp', i) as number;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/price`, qs);
					} else if(operation === 'creation'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/creation`, {});
					} else if(operation === 'mintAndBurn'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						qs.cursor = this.getNodeParameter('cursor', i) as string;
						qs.limit = this.getNodeParameter('limit', i) as number;
						qs.direction = this.getNodeParameter('direction', i) as string;
						qs.type = this.getNodeParameter('type', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/mintAndBurn`, qs);
					} else if(operation === 'security'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/security`, {});
					}
				} else if (resource === 'trade') {
					if(operation === 'trade'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						qs.cursor = this.getNodeParameter('cursor', i);
						qs.tokenAddress = this.getNodeParameter('tokenAddress', i);
						qs.direction = this.getNodeParameter('direction', i);
						qs.limit = this.getNodeParameter('limit', i);
						qs.walletAddress = this.getNodeParameter('walletAddress', i);
						qs.poolAddress = this.getNodeParameter('poolAddress', i);
						qs.beforeTimestamp = this.getNodeParameter('beforeTimestamp', i);
						qs.afterTimestamp = this.getNodeParameter('afterTimestamp', i);
						qs.beforeBlockHeight = this.getNodeParameter('beforeBlockHeight', i);
						qs.afterBlockHeight = this.getNodeParameter('afterBlockHeight', i);
						qs.type = this.getNodeParameter('type', i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `trade/${chainId}`, qs);
					} else if(operation === 'activity'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						qs.cursor = this.getNodeParameter('cursor', i);
						qs.limit = this.getNodeParameter('limit', i);
						qs.direction = this.getNodeParameter('direction', i);
						qs.tokenAddress = this.getNodeParameter('tokenAddress', i);
						qs.walletAddress = this.getNodeParameter('walletAddress', i);
						qs.poolAddress = this.getNodeParameter('poolAddress', i);
						qs.beforeTimestamp = this.getNodeParameter('beforeTimestamp', i);
						qs.afterTimestamp = this.getNodeParameter('afterTimestamp', i);
						qs.beforeBlockHeight = this.getNodeParameter('beforeBlockHeight', i);
						qs.afterBlockHeight = this.getNodeParameter('afterBlockHeight', i);
						qs.type = this.getNodeParameter('type', i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `trade/${chainId}/activities`, qs);
					} else if(operation === 'top-traders'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						qs.cursor = this.getNodeParameter('cursor', i);
						qs.limit = this.getNodeParameter('limit', i);
						qs.direction = this.getNodeParameter('direction', i);
						qs.tokenAddress = this.getNodeParameter('tokenAddress', i);
						qs.timeFrame = this.getNodeParameter('timeFrame', i);
						qs.sortType = this.getNodeParameter('sortType', i);
						qs.sortBy = this.getNodeParameter('sortBy', i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `trade/${chainId}/top-traders`, qs);
					} else if(operation === 'gainers-losers'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						qs.cursor = this.getNodeParameter('cursor', i);
						qs.limit = this.getNodeParameter('limit', i);
						qs.direction = this.getNodeParameter('direction', i);
						qs.type = this.getNodeParameter('type', i);
						qs.sortBy = this.getNodeParameter('sortBy', i);
						qs.sortType = this.getNodeParameter('sortType', i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `trade/${chainId}/gainers-losers`, qs);
					}
				} else if(resource === 'wallet'){
					if(operation === 'balance'){
						const chainId = this.getNodeParameter("chainId", i) as string;
						const walletAddress = this.getNodeParameter('walletAddress', i) as string;
						qs.tokenAddress = this.getNodeParameter('tokenAddress', i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `trade/${chainId}/wallet/${walletAddress}/balance`, qs);
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
