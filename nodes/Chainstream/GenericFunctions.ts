import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

function toSnakeCase(input: string): string {
    return input
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // camelCase → camel_Case
        .replace(/[\s\-]+/g, '_')
        .toLowerCase();
}

export async function chainstreamApiRequest(
    this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    resource: string,
    body: any = {},
    query: IDataObject = {},
    uri?: string,
    option: IDataObject = {},
): Promise<any> {
    const credentialType = 'chainstreamApi';
    const credentials = await this.getCredentials(credentialType);

    const baseUrl = String((credentials as any)?.apiBaseUrl ?? '');
    const url: string = uri !== undefined ? uri : `${baseUrl}/v1/${resource}`;

    const options: IHttpRequestOptions = {
        method,
        url,
        qs: query,
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

    return this.helpers.httpRequestWithAuthentication.call(this, credentialType, options);
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
            const snake = toSnakeCase(key);
            if (key !== snake) {
                element[snake] = element[key];
                delete element[key];
            }
        }
    }
    return elements;
}
