## @skeldjs/get-auth-token

A simple node.js adaptor for the [GetAuthToken](https://github.com/auproximity/GetAuthToken) program.

You can view auto-updating documentation for this package hosted at github pages at https://skeldjs.github.io/SkeldJS/modules/get_auth_token.html

## Example
```ts
import { authTokenHook } from "@skeldjs/get-auth-token";

const client = new SkeldjsClient("2021.4.2.0");

authTokenHook(client, {
    exe_path: "GetAuthToken.exe",
    cert_path: "PubsCert.pem"
});
```
