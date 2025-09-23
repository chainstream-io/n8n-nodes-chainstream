import type {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

export class ChainstreamApi implements ICredentialType {
	name = 'chainstreamApi';

	displayName = 'Chainstream API';

	documentationUrl = 'https://docs.chainstream.io/reference/authentication';

	icon = { light: 'file:chainstream.svg', dark: 'file:chainstream.svg' } as const;

	httpRequestNode = {
		name: 'Chainstream',
		docsUrl: 'https://docs.chainstream.io',
		apiBaseUrlPlaceholder: 'https://dex.asia.auth.chainstream.io',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'apiBaseUrl',
			type: 'string',
			required: true,
			default: 'https://api-dex.chainstream.io',
		},
		{
			displayName: 'Session Token',
			name: 'sessionToken',
			type: 'hidden',
			typeOptions: {
				expirable: true,
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Domain',
			name: 'domain',
			type: 'string',
			required: true,
			default: 'dex.asia.auth.chainstream.io',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			required: true,
			default: '',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			required: true,
			default: '',
		},
	];

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		try {
			const { access_token } = (await this.helpers.httpRequest({
				method: 'POST',
				url: `https://${credentials.domain}/oauth/token`,
				body: {
					client_id: credentials.clientId,
					client_secret: credentials.clientSecret,
					audience: `https://api.dex.chainstream.io`,
					grant_type: 'client_credentials',
					scope: 'webhook.read webhook.write',
				},
				headers: {
					'Content-Type': 'application/json',
				},
			})) as { access_token: string };
			return { sessionToken: access_token };	
		} catch(error) {
			return { error }
		}
		
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.sessionToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '=https://{{$credentials.apiBaseUrl}}',
			url: '/v1/blockchain',
		},
	};
}
