import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { chainstreamApiRequest } from './GenericFunctions';
import { tokenFields, tokenOperations } from './TokenDescription';
import { walletFields, walletOperations } from './WalletDescription';

export function getChainId(this: IExecuteFunctions | ILoadOptionsFunctions, index: number): string {
  const searchPatterns = [
    ['chainId', 'chain', 'Chain_ID', 'chain_id', 'network', 'chainName'],
    [/chain/i, /network/i, /blockchain/i, /chain_name/i, /name/i]
  ];

  const result = fuzzyFindParameter(this, index, searchPatterns);
  if (!result) {
    throw new NodeOperationError(
      this.getNode(),
      `Could not find chain ID parameter.`
    );
  }

  const normalized = result.toLowerCase().trim();
  return normalized === 'solana' ? 'sol' : normalized;
}

export function getTokenAddress(this: IExecuteFunctions | ILoadOptionsFunctions, index: number): string {
  const searchPatterns = [
    ['tokenAddress', 'Token_Address', 'token', 'contractAddress'],
    [/token/i, /address/i, /contract/i]
  ];

  const result = fuzzyFindParameter(this, index, searchPatterns);
  if (!result) {
    throw new NodeOperationError(
      this.getNode(),
      `Could not find token address parameter.`
    );
  }
  return result;
}

export function getWalletAddress(this: IExecuteFunctions | ILoadOptionsFunctions, index: number): string {
  const searchPatterns = [
		['walletAddress', 'Wallet_Address', 'wallet', 'Wallet'],
		[/wallet/i]
  ];

  const result = fuzzyFindParameter(this, index, searchPatterns);
  if (!result) {
    throw new NodeOperationError(
      this.getNode(),
      `Could not find wallet address parameter.`
    );
  }
  return result;
}

export function getStartTimestamp(this: IExecuteFunctions | ILoadOptionsFunctions, index: number): number {
  const searchPatterns = [
		['startTimestamp', 'Start_Timestamp', 'fromTimestamp', 'From_Timestamp', 'afterTimestamp', 'After_Timestamp', 'beginTimestamp', 'Begin_Timestamp', 'sinceTimestamp', 'Since_Timestamp', 'start_time', 'from_time', 'after_time', 'begin_time', 'since_time'],
		[/start/i, /from/i, /after/i, /begin/i, /since/i],
  ];

  const result = fuzzyFindParameterAsInt(this, index, searchPatterns, 'start timestamp');
  if (!result) {
    throw new NodeOperationError(
      this.getNode(),
      `Could not find token address parameter.`
    );
  }
  return result;
}

export function getEndTimestamp(this: IExecuteFunctions | ILoadOptionsFunctions, index: number): number {
	const searchPatterns = [
		['endTimestamp', 'End_Timestamp', 'toTimestamp', 'To_Timestamp', 'beforeTimestamp', 'Before_Timestamp', 'untilTimestamp', 'Until_Timestamp', 'end_time', 'to_time', 'before_time', 'until_time'],
		[/end/i, /to/i, /before/i, /until/i],
	];

	const result = fuzzyFindParameterAsInt(this, index, searchPatterns, 'end timestamp');
	if (!result) {
		throw new NodeOperationError(
			this.getNode(),
			`Could not find token address parameter.`
		);
	}
	return result;
}

export function fuzzyFindParameter(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  index: number,
  searchPatterns: (string | RegExp)[][],
): string | null {
  const nodeParameters = context.getNode().parameters ?? {};

  const tryGetValue = (paramName: string): string | null => {
    try {
      const value = context.getNodeParameter(paramName, index, undefined) as string | undefined;
      return value && value.trim() ? value.trim() : null;
    } catch {
      return null;
    }
  };

  for (const patternGroup of searchPatterns) {
    for (const pattern of patternGroup) {
      if (typeof pattern === 'string') {
        const value = tryGetValue(pattern);
        if (value) return value;
      } else {
        const matched = Object.keys(nodeParameters).find((name) => pattern.test(name));
        if (matched) {
          const value = tryGetValue(matched);
          if (value) return value;
        }
      }
    }
  }

  return null;
}


export function fuzzyFindParameterAsInt(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  index: number,
  searchPatterns: (string | RegExp)[][],
  parameterType: string
): number | null {
  for (const patternGroup of searchPatterns) {
    for (const pattern of patternGroup) {
      if (typeof pattern === 'string') {
        try {
          const value = context.getNodeParameter(pattern, index, undefined) as string | undefined;
          if (value && typeof value === 'string' && value.trim()) {
            const intValue = parseInt(value.trim(), 10);
            if (!isNaN(intValue)) {
              return intValue;
            }
          }
        } catch (error) {
        }
      } else {
        const nodeParameters = context.getNode().parameters;
        if (nodeParameters) {
          const matchedParam = Object.keys(nodeParameters).find(paramName =>
            pattern.test(paramName)
          );

          if (matchedParam) {
            try {
              const value = context.getNodeParameter(matchedParam, index, undefined) as string | undefined;
              if (value && typeof value === 'string' && value.trim()) {
                const intValue = parseInt(value.trim(), 10);
                if (!isNaN(intValue)) {
                  return intValue;
                }
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

export function getNodeParameterIgnoreCase(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  paramName: string,
  index: number
): string | number | undefined {
  const nodeParams = context.getNode().parameters;

  const matchedKey = Object.keys(nodeParams).find(
    key => key.toLowerCase() === paramName.toLowerCase()
  );

  if (!matchedKey) {
    return undefined;
  }

  const value = context.getNodeParameter(matchedKey, index, undefined);

  return typeof value === 'string' || typeof value === 'number'
    ? value
    : undefined;
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
		inputs: [{ type: 'main' }],
		outputs: [{ type: 'main' }],
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
					}
				],
				default: 'token',
			},
			...tokenOperations,
			...tokenFields,
			...walletOperations,
			...walletFields,
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

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				const buildRequest = (): { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: string; qs?: IDataObject } => {
					const qs: IDataObject = {};

					const chainId = (): string => getChainId.call(this, i);
					const tokenAddress = (): string => getTokenAddress.call(this, i);
					const walletAddress = (): string => getWalletAddress.call(this, i);

					const handlers: Record<string, Record<string, () => { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: string; qs?: IDataObject }>> = {
						token: {
							get: () => ({ method: 'GET', path: `token/${chainId()}/${tokenAddress()}` }),
							getMany: () => {
								qs.tokenAddresses = this.getNodeParameter('tokenAddresses', i) as string;
								return { method: 'GET', path: `token/${chainId()}/multi`, qs };
							},
							search: () => {
								qs.chains = this.getNodeParameter('chains', i) as string;
								qs.q = this.getNodeParameter('q', i) as string;
								qs.limit = this.getNodeParameter('limit', i) as number;
								return { method: 'GET', path: `token/search`, qs };
							},
							detail: () => ({ method: 'GET', path: `token/${chainId()}/${tokenAddress()}` }),
							metadata: () => ({ method: 'GET', path: `token/${chainId()}/${tokenAddress()}/metadata` }),
							liquidity: () => ({ method: 'GET', path: `token/${chainId()}/${tokenAddress()}/liquidity` }),
							stats: () => ({ method: 'GET', path: `token/${chainId()}/${tokenAddress()}/stats` }),
							holders: () => ({ method: 'GET', path: `token/${chainId()}/${tokenAddress()}/holders`, qs }),
							candles: () => {
								qs.resolution = getNodeParameterIgnoreCase(this, 'resolution', i) as string;
								return { method: 'GET', path: `token/${chainId()}/${tokenAddress()}/candles`, qs };
							},
							topHolders: () => ({ method: 'GET', path: `token/${chainId()}/${tokenAddress()}/topHolders` }),
							marketData: () => ({ method: 'GET', path: `token/${chainId()}/${tokenAddress()}/marketData` }),
							prices: () => ({ method: 'GET', path: `token/${chainId()}/${tokenAddress()}/prices`, qs }),
							price: () => {
								qs.timestamp = getNodeParameterIgnoreCase(this, 'timestamp', i) as number;
								return { method: 'GET', path: `token/${chainId()}/${tokenAddress()}/price`, qs };
							},
							creation: () => ({ method: 'GET', path: `token/${chainId()}/${tokenAddress()}/creation` }),
							mintAndBurn: () => {
								qs.type = getNodeParameterIgnoreCase(this, 'type', i) as string;
								return { method: 'GET', path: `token/${chainId()}/${tokenAddress()}/mintAndBurn`, qs };
							},
							security: () => ({ method: 'GET', path: `token/${chainId()}/${tokenAddress()}/security` }),
						},
						trade: {
							trade: () => ({ method: 'GET', path: `trade` }),
							activity: () => ({ method: 'GET', path: `trade/activities` }),
							'top-traders': () => ({ method: 'GET', path: `trade/top-traders` }),
							'gainers-losers': () => ({ method: 'GET', path: `trade/gainers-losers` }),
						},
						wallet: {
							balance: () => ({ method: 'GET', path: `wallet/${chainId()}/${walletAddress()}/balance` }),
						},
					};

					const resourceHandlers = handlers[resource];
					if (!resourceHandlers) {
							throw new NodeOperationError(this.getNode(), `Unsupported resource.`);
					}
					const opHandler = resourceHandlers[operation];
					if (!opHandler) {
						throw new NodeOperationError(this.getNode(), `Unsupported operation for resource`);
					}

					return opHandler();
				};

				const { method, path, qs } = buildRequest();
				const responseData = await chainstreamApiRequest.call(this, method, path, {}, qs || {});

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail && this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
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
