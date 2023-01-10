import { STATUS_CODES } from 'node:http';

import { AxiosResponse } from 'axios';
import { Config, Printer, Refs } from 'pretty-format';

type Stringify = (value: unknown) => string;
type AxiosResponseTransformer = (response: AxiosResponse) => AxiosResponse;

/**
 * Serialize an HTTP status line for an axios response.
 *
 * @param response The axios response to serialize.
 * @returns The HTTP status line.
 */
function serializeStatusLine({ status, statusText }: AxiosResponse): string {
  const result = `HTTP/1.1 ${status}`;
  if (statusText) {
    return `${result} ${statusText}`;
  }
  if (status in STATUS_CODES) {
    return `${result} ${STATUS_CODES[status]}`;
  }
  return result;
}

/**
 * Serialize axios HTTP headers.
 *
 * @param headers The axios headers object so serialize.
 * @param toString A function used to convert arbritary values to string.
 * @returns The HTTP headers as a string.
 */
function serializeHeaders({ headers }: AxiosResponse, toString: Stringify): string {
  return Object.entries(headers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([key, value]) =>
        `\n${key.replace(/((-|^)[a-z])/g, (m) => m.toUpperCase())}: ${
          typeof value === 'string' ? value : toString(value)
        }`,
    )
    .join('');
}

/**
 * Serialize the axios HTTP body.
 *
 * @param response The axios body data so serialize.
 * @param toString A function used to convert arbritary values to string.
 * @returns The HTTP body as a string.
 */
function serializeBody({ data, headers }: AxiosResponse, toString: Stringify): string {
  if (typeof data === 'string' && headers['content-type']?.split('/')[0] === 'text') {
    return data;
  }
  return toString(data);
}

/**
 * Serialize the Axios HTTP response.
 *
 * @param response The Axios response to serialize
 * @param toString XXX
 * @returns The Axios response serialized as a string.
 */
function serializeResponse(response: AxiosResponse, toString: Stringify): string {
  let result = serializeStatusLine(response);
  if (response.headers) {
    result += serializeHeaders(response, toString);
  }
  if (response.data !== '') {
    result += `\n\n${serializeBody(response, toString)}`;
  }
  return result;
}

/**
 * @internal
 * @param actual The actual value passed to expect.
 * @returns Whether or not the actual input is an axios response.
 */
export function test(actual: unknown): actual is AxiosResponse {
  return (
    typeof actual === 'object' &&
    actual != null &&
    'data' in actual &&
    typeof (actual as AxiosResponse).config === 'object' &&
    typeof (actual as AxiosResponse).headers === 'object' &&
    typeof (actual as AxiosResponse).status === 'number' &&
    typeof (actual as AxiosResponse).statusText === 'string'
  );
}

/**
 * Remove the date header from an axios response.
 *
 * @param response The axios repons to transform.
 * @returns The response without a `datw` header.
 */
export function defaultTransformer(response: AxiosResponse): AxiosResponse {
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(response.headers)) {
    if (key.toLowerCase() !== 'date') {
      headers[key] = value as string;
    }
  }

  return {
    ...response,
    headers,
  };
}

let transformResponse = defaultTransformer;

/**
 * Serialize an axios response as a string.
 *
 * @internal
 * @param response The axios response to serialize.
 * @param config THe jest snapshot configuration.
 * @param indentation The intentation to use for serializing entities.
 * @param depth The of the object to serialize.
 * @param refs Used for finding circular references.
 * @param printer The ejst pretty printer.
 * @returns The axios response represented as a string.
 */
export function serialize(
  response: AxiosResponse,
  config: Config,
  indentation: string,
  depth: number,
  refs: Refs,
  printer: Printer,
): string {
  return serializeResponse(transformResponse(response), (obj) =>
    printer(obj, config, indentation, depth, refs),
  );
}

/**
 * Set a function used to transform an axios response before serializing.
 *
 * The default transformer removes the `date` header.
 *
 * @param transformer A function to transform the axios response.
 */
export function setResponseTransformer(transformer: AxiosResponseTransformer): void {
  transformResponse = transformer;
}
