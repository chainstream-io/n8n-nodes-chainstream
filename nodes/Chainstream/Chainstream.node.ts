import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { chainstreamApiRequest } from './GenericFunctions';
import { tokenFields, tokenOperations } from './TokenDescription';
import { tradeFields, tradeOperations } from './TradeDescription';
import { walletFields, walletOperations } from './WalletDescription';

export function getChainId(this: IExecuteFunctions | ILoadOptionsFunctions, index: number): string {
  const searchPatterns = [
    ['chainId', 'chain', 'Chain_ID', 'chain_id', 'network'],
    [/chain/i, /network/i, /blockchain/i]
  ];

  const result = fuzzyFindParameter(this, index, searchPatterns, 'chain ID');
  if (!result) {
    throw new NodeOperationError(
      this.getNode(),
      `Could not find chain ID parameter. Tried patterns: ${JSON.stringify(searchPatterns)}. Available parameters: ${getAvailableParams(this)}`
    );
  }
  return result;
}

export function getTokenAddress(this: IExecuteFunctions | ILoadOptionsFunctions, index: number): string {
  const searchPatterns = [
    ['tokenAddress', 'Token_Address', 'token', 'contractAddress'],
    [/token/i, /address/i, /contract/i]
  ];

  const result = fuzzyFindParameter(this, index, searchPatterns, 'token address');
  if (!result) {
    throw new NodeOperationError(
      this.getNode(),
      `Could not find token address parameter. Tried patterns: ${JSON.stringify(searchPatterns)}. Available parameters: ${getAvailableParams(this)}`
    );
  }
  return result;
}

export function fuzzyFindParameter(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  index: number,
  searchPatterns: (string | RegExp)[][],
  parameterType: string
): string | null {
  for (const patternGroup of searchPatterns) {
    for (const pattern of patternGroup) {
      if (typeof pattern === 'string') {
        try {
          const value = context.getNodeParameter(pattern, index, undefined) as string | undefined;
          if (value && typeof value === 'string' && value.trim()) {
            return value.trim();
          }
        } catch (error) {
        }
      } else {
        // 正则表达式模糊匹配
        const nodeParameters = context.getNode().parameters;
        if (nodeParameters) {
          const matchedParam = Object.keys(nodeParameters).find(paramName =>
            pattern.test(paramName)
          );

          if (matchedParam) {
            try {
              const value = context.getNodeParameter(matchedParam, index, undefined) as string | undefined;
              if (value && typeof value === 'string' && value.trim()) {
                return value.trim();
              }
            } catch (error) {
            }
          }
        }
      }
    }
  }

  return null;
}

export function getAvailableParams(context: IExecuteFunctions | ILoadOptionsFunctions): string {
  try {
    const node = context.getNode();
    return node.parameters ? Object.keys(node.parameters).join(', ') : 'none';
  } catch (error) {
    return 'unknown';
  }
}

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
						name: 'Wallet',
						value: 'wallet',
					},
					{
						name: 'Trade',
						value: 'trade',
					}
				],
				default: 'token',
			},
			...tokenOperations,
			...tokenFields,
			...walletOperations,
			...walletFields,
			...tradeOperations,
			...tradeFields,
		],
	};

	methods = {
		loadOptions: {
			async getChains(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const response = await chainstreamApiRequest.call(this, 'GET', 'blockchain');

				if (!Array.isArray(response)) return returnData;

				for (const chain of response) {
					const symbol = chain.symbol?.toLowerCase();
					const name = chain.name ?? symbol;

					if (!symbol || !name) continue;

					returnData.push({
						name: name,
						value: symbol,
					});
				}

				return returnData;
			},
		},
	};


	getQueryParams(this: IExecuteFunctions, i: number, paramNames: string[]): IDataObject {
			const qs: IDataObject = {};
			paramNames.forEach(param => {
					const value = this.getNodeParameter(param, i);
					if (value !== undefined && value !== null && value !== '') {
							qs[param] = value;
					}
			});
			return qs;
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let responseData;
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);


		for (let i = 0; i < length; i++) {
			const qs: IDataObject = {};
			try {
				if (resource === 'token') {
					if (operation === 'get') {
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}`, {});
					} else if (operation === 'getMany') {
						const chainId = getChainId.call(this, i);
						qs.tokenAddresses = this.getNodeParameter('tokenAddresses', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/multi`, {}, qs);
					} else if (operation === 'search') {
						const chains = this.getNodeParameter("chains", i) as string;
						qs.chains = chains;
						qs.q = this.getNodeParameter('q', i) as string;
						qs.limit = this.getNodeParameter('limit', i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/search`, {}, qs);
					} else if(operation === 'detail'){
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}`, {});
					} else if(operation === 'metadata'){
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/metadata`, {});
					} else if(operation === 'liquidity'){
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/liquidity`, {});
					} else if(operation === 'stats'){
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/stats`, {});
					} else if(operation === 'holders'){
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						qs.limit = this.getNodeParameter('limit', i) as number;
						qs.cursor = this.getNodeParameter('cursor', i) as string;
						qs.direction = this.getNodeParameter('direction', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/holders`, qs);
					} else if(operation === 'candles'){
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						qs.resolution = this.getNodeParameter('resolution', i) as string;
						qs.from = this.getNodeParameter('from', i) as number;
						qs.to = this.getNodeParameter('to', i) as number;
						qs.limit = this.getNodeParameter('limit', i) as number;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/candles`, qs);
					} else if(operation === 'topHolders'){
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/topHolders`, {});
					} else if(operation === 'marketData'){
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/marketData`, {});
					} else if(operation === 'prices'){
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						qs.cursor = this.getNodeParameter('cursor', i) as string;
						qs.direction = this.getNodeParameter('direction', i) as string;
						qs.limit = this.getNodeParameter('limit', i) as number;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/prices`, qs);
					} else if(operation === 'price'){
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						qs.timestamp = this.getNodeParameter('timestamp', i) as number;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/price`, qs);
					} else if(operation === 'creation'){
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/creation`, {});
					} else if(operation === 'mintAndBurn'){
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						qs.cursor = this.getNodeParameter('cursor', i) as string;
						qs.limit = this.getNodeParameter('limit', i) as number;
						qs.direction = this.getNodeParameter('direction', i) as string;
						qs.type = this.getNodeParameter('type', i) as string;
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/mintAndBurn`, qs);
					} else if(operation === 'security'){
						const chainId = getChainId.call(this, i);
						const tokenAddress = getTokenAddress.call(this, i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `token/${chainId}/${tokenAddress}/security`, {});
					}
				} else if (resource === 'trade') {
					if(operation === 'trade'){
						const chainId = getChainId.call(this, i);
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
						const chainId = getChainId.call(this, i);
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
						const chainId = getChainId.call(this, i);
						qs.cursor = this.getNodeParameter('cursor', i);
						qs.limit = this.getNodeParameter('limit', i);
						qs.direction = this.getNodeParameter('direction', i);
						qs.tokenAddress = this.getNodeParameter('tokenAddress', i);
						qs.timeFrame = this.getNodeParameter('timeFrame', i);
						qs.sortType = this.getNodeParameter('sortType', i);
						qs.sortBy = this.getNodeParameter('sortBy', i);
						responseData = await chainstreamApiRequest.call(this, 'GET', `trade/${chainId}/top-traders`, qs);
					} else if(operation === 'gainers-losers'){
						const chainId = getChainId.call(this, i);
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
						const chainId = getChainId.call(this, i);
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
