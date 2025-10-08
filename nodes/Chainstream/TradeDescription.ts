import type { INodeProperties } from 'n8n-workflow';

export const tradeOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['trade'],
      },
    },
    options: [
      { name: 'Activity', value: 'activity', description: 'List trade activity', action: 'List trade activity' },
      { name: 'Gainers Losers', value: 'gainers-losers', description: 'Get daily gainers and losers', action: 'Get gainers and losers' },
      { name: 'Top Traders', value: 'top-traders', description: 'Get top traders for a token', action: 'Get top traders' },
      { name: 'Trade', value: 'trade', description: 'Get trades', action: 'Get trades' },
    ],
    default: 'top-traders',
  },
];

export const tradeFields: INodeProperties[] = [
  // Chain ID (shared)
  {
    displayName: 'Chain Name or ID',
    name: 'chainId',
    type: 'options',
    default: '',
    typeOptions: {
      loadOptionsMethod: 'getChains',
    },
    displayOptions: {
      show: {
        resource: ['trade'],
        operation: ['trade', 'activity', 'top-traders', 'gainers-losers'],
      },
    },
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    required: true,
  },

  /* trade:top-traders & trade:trade & trade:activity */
  {
    displayName: 'Token Address',
    name: 'tokenAddress',
    type: 'string',
    typeOptions: {
      password: true,
    },
    default: '',
    displayOptions: {
      show: {
        resource: ['trade'],
        operation: ['top-traders', 'trade', 'activity'],
      },
    },
    required: true,
  },
  {
    displayName: 'Cursor',
    name: 'cursor',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['trade'],
        operation: ['top-traders', 'trade', 'activity', 'gainers-losers'],
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
        resource: ['trade'],
        operation: ['top-traders', 'trade', 'activity', 'gainers-losers'],
      },
    },
  },
];
