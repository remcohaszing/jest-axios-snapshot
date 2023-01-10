import { defaultTransformer, setResponseTransformer } from './jest-axios-snapshot.js';

afterEach(() => {
  setResponseTransformer(defaultTransformer);
});

it('should serialize response bodies', () => {
  const response = {
    config: {},
    status: 200,
    statusText: 'OK',
    headers: { connection: 'close', 'content-type': 'application/json' },
    data: {
      arrays: [],
      objects: {},
      true: true,
      false: false,
      null: null,
      strings: 'Hello',
      nested: {
        object: {
          containing: {
            numbers: 42,
            arrays: [],
            objects: {},
            true: true,
            false: false,
            null: null,
            strings: 'Hello',
          },
        },
        arrays: ['containing', 1337, [true, false, []]],
      },
    },
  };
  expect(response).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Type: application/json

    {
      "arrays": [],
      "false": false,
      "nested": {
        "arrays": [
          "containing",
          1337,
          [
            true,
            false,
            [],
          ],
        ],
        "object": {
          "containing": {
            "arrays": [],
            "false": false,
            "null": null,
            "numbers": 42,
            "objects": {},
            "strings": "Hello",
            "true": true,
          },
        },
      },
      "null": null,
      "objects": {},
      "strings": "Hello",
      "true": true,
    }
  `);
});

it('should support empty responses', () => {
  const response = {
    config: {},
    status: 200,
    statusText: 'No Content',
    headers: { connection: 'close' },
    data: '',
  };
  expect(response).toMatchInlineSnapshot(`
    HTTP/1.1 200 No Content
    Connection: close
  `);
});

it('should support a custom status text', () => {
  const response = {
    config: {},
    status: 404,
    statusText: 'Not here',
    headers: { connection: 'close' },
    data: '',
  };
  expect(response).toMatchInlineSnapshot(`
    HTTP/1.1 404 Not here
    Connection: close
  `);
});

it('should support a empty status text', () => {
  const response = {
    config: {},
    status: 404,
    statusText: '',
    headers: { connection: 'close' },
    data: '',
  };
  expect(response).toMatchInlineSnapshot(`
    HTTP/1.1 404 Not Found
    Connection: close
  `);
});

it('should support unknown status codes', () => {
  const response = {
    config: {},
    status: 222,
    statusText: '',
    headers: { connection: 'close' },
    data: '',
  };
  expect(response).toMatchInlineSnapshot(`
    HTTP/1.1 222
    Connection: close
  `);
});

it('should serialize text response bodies as-is', () => {
  const response = {
    config: {},
    status: 200,
    statusText: 'OK',
    headers: { connection: 'close', 'content-type': 'text/html' },
    data: '<!doctype html>\n<html>\n  <body>\n    <h1>Test</h1>\n  </body>\n</html>',
  };
  expect(response).toMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Type: text/html

    <!doctype html>
    <html>
      <body>
        <h1>Test</h1>
      </body>
    </html>
  `);
});

it('should support a custom response transformer', () => {
  setResponseTransformer((config) => ({
    ...config,
    status: 1337,
  }));
  const response = {
    config: {},
    status: 200,
    statusText: 'OK',
    headers: { connection: 'close', 'content-type': 'application/json' },
    data: {},
  };
  expect(response).toMatchInlineSnapshot(`
    HTTP/1.1 1337 OK
    Connection: close
    Content-Type: application/json

    {}
  `);
});

it('should header printers', () => {
  setResponseTransformer((config) => ({
    ...config,
    status: 1337,
  }));
  const response = {
    config: {},
    status: 200,
    statusText: 'OK',
    headers: { connection: 'close', 'content-type': expect.any(String) },
    data: {},
  };
  expect(response).toMatchInlineSnapshot(`
    HTTP/1.1 1337 OK
    Connection: close
    Content-Type: Any<String>

    {}
  `);
});

it('should not crash on text content if no content-type is defined', () => {
  setResponseTransformer((config) => ({
    ...config,
    status: 1337,
  }));
  const response = {
    config: {},
    status: 200,
    statusText: 'OK',
    headers: { connection: 'close' },
    data: 'text',
  };
  expect(response).toMatchInlineSnapshot(`
    HTTP/1.1 1337 OK
    Connection: close

    "text"
  `);
});
