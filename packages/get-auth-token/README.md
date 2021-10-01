## @skeldjs/get-auth-token

### Deprecated in favour of using @skeldjs/client by itself, which has been updated to use @skeldjs/dtls.

A simple node.js adaptor for the [GetAuthToken](https://github.com/auproximity/GetAuthToken) program.

You can view auto-updating documentation for this package hosted at github pages at https://skeld.js.org/modules/get_auth_token.html

## Example
```ts
import { authTokenHook } from "@skeldjs/get-auth-token";

const client = new SkeldjsClient("2021.4.25");

authTokenHook(client, {
    exe_path: "GetAuthToken.exe",
    cert_path: "PubsCert.pem"
});
```
