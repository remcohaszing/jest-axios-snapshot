# Jest Axios Snapshot

> Test Axios responses using Jest snapshots

[![build status](https://github.com/remcohaszing/jest-axios-snapshot/workflows/ci/badge.svg)](https://github.com/remcohaszing/jest-axios-snapshot/actions)
[![codecov](https://codecov.io/gh/remcohaszing/jest-axios-snapshot/branch/main/graph/badge.svg)](https://codecov.io/gh/remcohaszing/jest-axios-snapshot)
[![npm](https://img.shields.io/npm/v/jest-axios-snapshot)](https://www.npmjs.com/package/jest-axios-snapshot)
[![prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)
[![jest](https://jestjs.io/img/jest-badge.svg)](https://jestjs.io)

## Installation

```sh
npm install jest-axios-snapshot
```

## Usage

Add the following to your Jest configuration:

```json
{
  "snapshotSerializers": ["jest-axios-snapshot"]
}
```

Now use an Axios response to match a Jest snapshot.

```js
import axios from 'axios';

it('should download example.com', async () => {
  const response = await axios.get('https://example.com');
  expect(response).toMatchSnapshot();
});
```

This was written with [axios-test-instance](https://github.com/remcohaszing/axios-test-instance) and
inline snapshots in mind.

```ts
import { request, setTestApp } from 'axios-test-instance';

import { app } from './app';

beforeAll(async () => {
  await setTestApp(app);
});

it('should get data', async () => {
  const response = await request.get('/');

  expect(response).tpMatchInlineSnapshot(`
    HTTP/1.1 200 OK
    Connection: close
    Content-Length: 17
    Content-Type: application/json; charset=utf-8

    {
      "hello": "world"
    }
  `);
});
```

By default the `Date` header will be stripped. To set a custom response transformer, use
`setResponseTransformer`

```js
import { setResponseTransformer } from 'jest-axios-snapshot';

setResponseTransformer((response) => {
  // Modify response
  const { etag, ...headers } = response.headers;
  return {
    ...response,
    headers,
  };
});
```
