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
    ],
    default: 'balance',
  },
];

export const walletFields: INodeProperties[] = [
  {
    displayName: 'Chain ID Name or ID',
    name: 'chain',
    type: 'options',
    default: '',
    typeOptions: {
      loadOptionsMethod: 'getChains',
    },
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['balance'],
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
        operation: ['balance'],
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
    description: 'Specific token address to filter wallet balances',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['balance'],
      },
    },
  }
];
