import { snakeCase } from 'change-case';
import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';

export async function chainstreamApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,

	body: any = {},
	query: IDataObject = {},
	uri?: string,
	option: IDataObject = {},
): Promise<any> {
	const authenticationMethod = this.getNodeParameter('authentication', 0, 'apiKey') as string;

	let credentials;
	let credentialType = 'chainstreamApi';

	if (authenticationMethod === 'apiKey') {
		credentialType = 'chainstreamApi';
		credentials = await this.getCredentials(credentialType);
	} else {
    	credentialType = 'chainstreamApi';
		credentials = await this.getCredentials(credentialType);    
    }

	const options: IRequestOptions = {
		method,
		qs: query,
		uri: uri || `https://${credentials.apiBaseUrl}/v1/${resource}`,
		body,
		json: true,
	};

	if (Object.keys(option).length !== 0) {
		Object.assign(options, option);
	}
	if (Object.keys(body as IDataObject).length === 0) {
		delete options.body;
	}
	if (Object.keys(query).length === 0) {
		delete options.qs;
	}

	return await this.helpers.requestWithAuthentication.call(this, credentialType, options);
}

export function keysToSnakeCase(elements: IDataObject[] | IDataObject): IDataObject[] {
	if (elements === undefined) {
		return [];
	}
	if (!Array.isArray(elements)) {
		elements = [elements];
	}
	for (const element of elements) {
		for (const key of Object.keys(element)) {
			if (key !== snakeCase(key)) {
				element[snakeCase(key)] = element[key];
				delete element[key];
			}
		}
	}
	return elements;
}
