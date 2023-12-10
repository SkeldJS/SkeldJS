#!/usr/bin/env node
import { EosHttpApi } from "@skeldjs/eos";

const parsedArgs: Record<string, string> = {};
const argv = process.argv.slice(2);
let currentArg: string|undefined;
while ((currentArg = argv.shift()) !== undefined) {
    if (currentArg.startsWith("--")) {
        const optionName = currentArg.substring(2);
        const optionValue = argv.shift();

        if (!optionValue)
            continue;

        parsedArgs[optionName] = optionValue;
    }
}

const clientId = parsedArgs.clientId || "xyza7891qtrmoYLr86we6DlfCA1RRsp8";
const clientSecret = parsedArgs.clientSecret || "nGThQanzvthA2HPaARXe/xutzsKyx5WJveNkBx44ti4";
const deploymentId = parsedArgs.deploymentId || "503cd077a7804777aee5a6eeb5cfe62d";
const displayName = parsedArgs.displayName || Math.random().toString(16).substr(2);

(async () => {
    const randomDeviceModel = EosHttpApi.generateRandomDeviceModel();
    const { access_token } = await EosHttpApi.authRequestGetDeviceIdAccessToken(clientId, clientSecret, randomDeviceModel);

    const account = await EosHttpApi.authRequestEosAccessToken({
        grantType: "external_auth",
        externalAuthType: "deviceid_access_token",
        clientId: clientId,
        clientSecret: clientSecret,
        deploymentId: deploymentId,
        nonce: "aaaaaaaaab",
        displayName: displayName,
        externalAuthToken: access_token,
    });

    console.log("====================================================");
    console.log("Access token: %s", access_token);
    console.log("====================================================");
    console.log("ID token: %s", account.id_token);
    console.log("====================================================");
    console.log("EOS product id: %s", account.product_user_id);
    console.log("====================================================");
    console.log("Expires at: %s", account.expires_at);
})();
