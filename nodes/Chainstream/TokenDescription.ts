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
			{
				name: 'Get',
				value: 'get',
				description: 'Get an token',
				action: 'Get an token',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get many tokens',
				action: 'Get many tokens',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search for tokens',
				action: 'Search for tokens',
			},
		],
		default: 'get',
	},
];

export const tokenFields: INodeProperties[] = [
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
                operation: ['get', 'getMany'],
            },
        },
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		required: true,
    },
    
    /* -------------------------------------------------------------------------- */
	/*                                token:get                                   */
	/* -------------------------------------------------------------------------- */
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
				operation: ['get'],
			},
		},
		required: true,
	},
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
    /* -------------------------------------------------------------------------- */
	/*                                token:getMany                               */
	/* -------------------------------------------------------------------------- */
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

	/* -------------------------------------------------------------------------- */
	/*                                token:search                                */
	/* -------------------------------------------------------------------------- */
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
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['token'],
				operation: ['search'],
			},
		},
		typeOptions: {
			minValue: 1,
			// eslint-disable-next-line n8n-nodes-base/node-param-type-options-max-value-present
			maxValue: 250,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	
];
