import type { INodeProperties } from 'n8n-workflow';

export const tokenOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['token'],
            },
        },
        options: [
            { name: 'Candles', value: 'candles', description: 'Get token candles', action: 'Get token candles' },
            { name: 'Creation', value: 'creation', description: 'Get token creation info', action: 'Get token creation' },
            { name: 'Detail', value: 'detail', description: 'Get token detail', action: 'Get token detail' },
            { name: 'Get', value: 'get', description: 'Get a token', action: 'Get a token' },
            { name: 'Get Many', value: 'getMany', description: 'Get many tokens', action: 'Get many tokens' },
            { name: 'Holders', value: 'holders', description: 'List token holders', action: 'List token holders' },
            { name: 'Liquidity', value: 'liquidity', description: 'Get token liquidity pools', action: 'Get token liquidity' },
            { name: 'Market Data', value: 'marketData', description: 'Get token market data', action: 'Get market data' },
            { name: 'Metadata', value: 'metadata', description: 'Get token metadata', action: 'Get token metadata' },
            { name: 'Mint And Burn', value: 'mintAndBurn', description: 'Get token mint and burn activity', action: 'Get mint and burn' },
            { name: 'Price', value: 'price', description: 'Get token price at timestamp', action: 'Get token price' },
            { name: 'Prices', value: 'prices', description: 'Get token prices', action: 'Get token prices' },
            { name: 'Search', value: 'search', description: 'Search for tokens', action: 'Search for tokens' },
            { name: 'Security', value: 'security', description: 'Get token security info', action: 'Get token security' },
            { name: 'Stats', value: 'stats', description: 'Get token stats', action: 'Get token stats' },
            { name: 'Top Holders', value: 'topHolders', description: 'Get top holders', action: 'Get top holders' },
        ],
        default: 'get',
    },
];

export const tokenFields: INodeProperties[] = [
  // Chain ID (shared)
  {
    // eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
    displayName: 'Chain ID',
    name: 'chainId',
    type: 'options',
    default: '',
    typeOptions: {
      loadOptionsMethod: 'getChains',
    },
    displayOptions: {
      show: {
        resource: ['token'],
        operation: [
          'get','getMany','search','detail','metadata','liquidity','stats','holders','candles','topHolders','marketData','prices','price','creation','mintAndBurn','security',
        ],
      },
    },
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    required: true,
  },

  /* token:get, token:detail, token:metadata, token:liquidity, token:stats,
     token:holders, token:candles, token:topHolders, token:marketData,
     token:prices, token:price, token:creation, token:mintAndBurn, token:security */
  {
    displayName: 'Token Address',
    name: 'tokenAddress',
    type: 'string',
    default: '',
    // eslint-disable-next-line n8n-nodes-base/node-param-type-options-password-missing
    typeOptions: {
      password: false,
    },
    displayOptions: {
      show: {
        resource: ['token'],
        operation: [
          'get','detail','metadata','liquidity','stats','holders','candles','topHolders','marketData','prices','price','creation','mintAndBurn','security',
        ],
      },
    },
    required: true,
  },

  /* token:get specific options collection */
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        operation: ['get'],
        resource: ['token'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Fields',
        name: 'fields',
        type: 'string',
        default: '',
        description:
          'Fields the token will return, formatted as a string of comma-separated values. By default all the fields are returned.',
      },
    ],
  },

  /* token:getMany */
  {
    displayName: 'Token Addresses',
    name: 'tokenAddresses',
    type: 'string',
    default: '',
    description: 'The token addresses, formatted as a string of comma-separated values',
    // eslint-disable-next-line n8n-nodes-base/node-param-type-options-password-missing
    typeOptions: {
      password: false,
    },
    displayOptions: {
      show: {
        operation: ['getMany'],
        resource: ['token'],
      },
    },
  },

  /* token:search */
  {
    displayName: 'Chains',
    name: 'chains',
    type: 'string',
    default: '',
    description: 'The chains, formatted as a string of comma-separated values',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['search'],
      },
    },
  },
  {
    displayName: 'Query',
    name: 'q',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['search'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['search','getMany','holders','prices','candles','mintAndBurn'],
      },
    },
    typeOptions: {
      minValue: 1,
      // eslint-disable-next-line n8n-nodes-base/node-param-type-options-max-value-present
      maxValue: 200,
    },
    default: 50,
    description: 'Max number of results to return',
  },

  /* token:holders pagination */
  {
    displayName: 'Cursor',
    name: 'cursor',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['holders','prices','mintAndBurn'],
      },
    },
  },
  {
    displayName: 'Direction',
    name: 'direction',
    type: 'options',
    options: [
      { name: 'Next', value: 'next' },
      { name: 'Prev', value: 'prev' },
    ],
    default: 'next',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['holders','prices','mintAndBurn'],
      },
    },
  },

  /* token:candles */
  {
    displayName: 'Resolution',
    name: 'resolution',
    type: 'options',
    options: [ //Available options: 1s, 15s, 30s, 1m, 5m, 15m, 1h, 4h, 12h, 1d
			{ name: '12h', value: '12h' },
			{ name: '15m', value: '15m' },
			{ name: '15s', value: '15s' },
			{ name: '1d', value: '1d' },
      { name: '1h', value: '1h' },
      { name: '1m', value: '1m' },
     	{ name: '1s', value: '1s' },
			{ name: '30s', value: '30s' },
      { name: '4h', value: '4h' },
      { name: '5m', value: '5m' },
    ],
    default: '1m',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['candles'],
      },
    },
  },
  {
    displayName: 'Start Timestamp (Unix Epoch In Milliseconds)',
    name: 'from',
    type: 'number',
    default: 0,
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['candles'],
      },
    },
  },
  {
		displayName: 'End Timestamp (Unix Epoch In Milliseconds)',
    name: 'to',
    type: 'number',
    default: 0,
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['candles'],
      },
    },
  },

  /* token:prices pagination (limit already included above) */
  {
    displayName: 'Prices Limit',
    name: 'pricesLimit',
    type: 'number',
    default: 100,
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['prices'],
      },
    },
    typeOptions: {
      minValue: 1,
    },
    description: 'Limit for prices endpoint (separate from search limit)',
  },

  /* token:price */
  {
    displayName: 'Timestamp (Seconds)',
    name: 'timestamp',
    type: 'number',
    default: 0,
    description: 'Timestamp for price lookup',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['price'],
      },
    },
  },

  /* token:mintAndBurn filters and pagination */
  {
    displayName: 'Type',
    name: 'type',
    type: 'options',
    options: [
      { name: 'All', value: 'all' },
      { name: 'Mint', value: 'mint' },
      { name: 'Burn', value: 'burn' },
    ],
    default: 'all',
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['mintAndBurn'],
      },
    },
  },

  /* token:topHolders no extra params (kept for clarity) */
  {
    displayName: 'Top Holders Limit',
    name: 'topHoldersLimit',
    type: 'number',
    default: 10,
    displayOptions: {
      show: {
        resource: ['token'],
        operation: ['topHolders'],
      },
    },
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
  },
];
