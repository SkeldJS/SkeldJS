As a temporary solution to the account system/Airship update breaking the SkeldJS client, a [package is available](https://npmjs.com/package/@skeldjs/get-auth-token) to make the process easier if you need to use the client on official servers.

Otherwise, I am working on a fork of [nodertc/dtls](https://github.com/nodertc/dtls) that should hopefully be ready soon enough, and will be abstracted away in the client.

The package is a small wrapper for the [GetAuthToken](https://github.com/auproximity/GetAuthToken) C# program, and requires you to install that.

## Installing GetAuthToken

### Add as a submodule or clone the repository
If you are working in a git repository, you should add the GetAuthToken program as a git submodule, using `git submodule add https://github.com/auproximity/GetAuthToken.git` else, you should clone the repository using `git clone https://github.com/auproximity/GetAuthToken.git`

### Build
Next, you need to build GetAuthToken. Move into the repository with `cd GetAuthToken/hazeltest` and run the included bash script with `./build.sh`. Make sure you have the [.NET SDK](https://dotnet.microsoft.com/download) installed

## Installing @skeldjs/get-auth-token

### Install with npm or yarn
You can install get-auth-token with `npm install --save @skeldjs/get-auth-token` or `yarn add @skeldjs/get-auth-token`.

### Setting up
Setup is relatively simple, and the following code snippet should be enough.
```ts
import { authTokenHook } from "@skeldjs/get-auth-token";

authTokenHook(client, {
    exe_path: "",
    cert_path: ""
});
```

The function to setup hooking takes in two options, the path to the output directory from building the GetAuthToken directory and the path to a public server certificate. The one used for official servers is below.

This will automatically run the program and get an authentication token before connecting.

### Official Servers Cert
```
-----BEGIN CERTIFICATE-----
MIIDbTCCAlWgAwIBAgIUf8xD1G/d5NK1MTjQAYGqd1AmBvcwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAgFw0yMTAyMDIxNzE4MDFaGA8yMjk0
MTExODE3MTgwMVowRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUx
ITAfBgNVBAoMGEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAL7GFDbZdXwPYXeHWRi2GfAXkaLCgxuSADfa1pI2
vJkvgMTK1miSt3jNSg/o6VsjSOSL461nYmGCF6Ho3fMhnefOhKaaWu0VxF0GR1bd
e836YWzhWINQRwmoVD/Wx1NUjLRlTa8g/W3eE5NZFkWI70VOPRJpR9SqjNHwtPbm
Ki41PVgJIc3m/7cKOEMrMYNYoc6E9ehwLdJLQ5olJXnMoGjHo2d59hC8KW2V1dY9
sacNPUjbFZRWeQ0eJ7kbn8m3a5EuF34VEC7DFcP4NCWWI7HO5/KYE+mUNn0qxgua
r32qFnoaKZr9dXWRWJSm2XecBgqQmeF/90gdbohNNHGC/iMCAwEAAaNTMFEwHQYD
VR0OBBYEFAJAdUS5AZE3U3SPQoG06Ahq3wBbMB8GA1UdIwQYMBaAFAJAdUS5AZE3
U3SPQoG06Ahq3wBbMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEB
ALUoaAEuJf4kQ1bYVA2ax2QipkUM8PL9zoNiDjUw6ZlwMFi++XCQm8XDap45aaeZ
MnXGBqIBWElezoH6BNSbdGwci/ZhxXHG/qdHm7zfCTNaLBe2+sZkGic1x6bZPFtK
ZUjGy7LmxsXOxqGMgPhAV4JbN1+LTmOkOutfHiXKe4Z1zu09mOo9sWfGCkbIyERX
QQILBYSIkg3hU4R4xMOjvxcDrOZja6fSNyi2sgidTfe5OCKC2ovU7OmsQqzb7mFv
e+7kpIUp6AZNc49n6GWtGeOoL7JUAqMOIO+R++YQN7/dgaGDPuu0PpmgI2gPLNW1
ZwHJ755zQQRX528xg9vfykY=
-----END CERTIFICATE-----
```
