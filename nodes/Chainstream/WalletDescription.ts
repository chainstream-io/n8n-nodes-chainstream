import type { INodeProperties } from 'n8n-workflow';

export const walletOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['wallet'],
      },
    },
    options: [
      { name: 'Balance', value: 'balance', description: 'Get wallet balance', action: 'Get wallet balance' },
      { name: 'Calculate PnL', value: 'calculate-pnl', description: 'Calculate wallet PnL for tokens', action: 'Calculate' },
      { name: 'Pnl', value: 'pnl', description: 'Get wallet PnL and trades', action: 'Get wallet pnl' },
      { name: 'Stats', value: 'stats', description: 'Get wallet trading stats', action: 'Get wallet stats' },
    ],
    default: 'pnl',
  },
];

export const walletFields: INodeProperties[] = [
  // Chain ID (shared)
  {
    displayName: 'Chain ID Name or ID',
    name: 'chainId',
    type: 'options',
    default: '',
    typeOptions: {
      loadOptionsMethod: 'getChains',
    },
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['pnl', 'stats', 'balance', 'calculate-pnl'],
      },
    },
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    required: true,
  },
  {
    displayName: 'Wallet Address',
    name: 'walletAddress',
    type: 'string',
    default: '',
    typeOptions: {
      password: true,
    },
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['pnl', 'stats', 'balance', 'calculate-pnl'],
      },
    },
    required: true,
  },
  {
    displayName: 'Token Address',
    name: 'tokenAddress',
    type: 'string',
    typeOptions: {
      password: true,
    },
    default: '',
    description: 'Optional token address to filter results',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['pnl', 'balance'],
      },
    },
  },
  {
    displayName: 'Token Addresses',
    name: 'tokenAddresses',
    type: 'string',
    typeOptions: {
      password: true,
    },
    default: '',
    description: 'Comma-separated token addresses for PnL calculation',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['calculate-pnl'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: {
      minValue: 1,
    },
    description: 'Max number of results to return',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['calculate-pnl', 'balance'],
      },
    },
  },
  {
    displayName: 'Cursor',
    name: 'cursor',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['calculate-pnl', 'balance'],
      },
    },
  },
  {
    displayName: 'Direction',
    name: 'direction',
    type: 'options',
    options: [
      { name: 'Backward', value: 'backward' },
      { name: 'Forward', value: 'forward' },
    ],
    default: 'forward',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['calculate-pnl', 'balance'],
      },
    },
  },
];
