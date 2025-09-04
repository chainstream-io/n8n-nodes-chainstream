import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;
		
		let authentication = 'apiKey';
		try {
			authentication = this.getNodeParameter('authentication', 0) as string;
		} catch (error) {
			this.logger.debug('Authentication parameter not found, using default "apiKey" transport');
		}

		try {
			if (authentication === 'apiKey') {
				// const apiKeyCredentials = await this.getCredentials('chainstreamApi');

			} else {
			}


			switch (operation) {
				default:
					throw new NodeOperationError(this.getNode(), `Operation ${operation} not supported`);
			}

			return [returnData];
		} catch (error) {
			throw new NodeOperationError(
				this.getNode(),
				`Failed to execute operation: ${(error as Error).message}`,
			);
		}
	}
}
