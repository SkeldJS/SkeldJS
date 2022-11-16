import { GameCode } from "@skeldjs/util";
import * as skeldjs from "../index";
import { AuthMethod, EosHttpApi } from "../index";

const clientId = "xyza7891qtrmoYLr86we6DlfCA1RRsp8";
const clientSecret = "nGThQanzvthA2HPaARXe/xutzsKyx5WJveNkBx44ti4";

(async () => {
    const randomDeviceModel = EosHttpApi.generateRandomDeviceModel();
    const { access_token } = await EosHttpApi.authRequestGetDeviceIdAccessToken(clientId, clientSecret, randomDeviceModel);

    const account = await EosHttpApi.authRequestEosAccessToken({
        grantType: "external_auth",
        externalAuthType: "deviceid_access_token",
        clientId: clientId,
        clientSecret: clientSecret,
        deploymentId: "3ce14d8292084c80a8364a8b5f0dfbf4",
        nonce: "aaaaaaaaab",
        displayName: "edqx",
        externalAuthToken: access_token,
    });

const client = new skeldjs.SkeldjsClient("2022.9.2.0s", "weakeyes", {
    authMethod: AuthMethod.SecureTransport,
    idToken: account.id_token,
    eosProductUserId: account.product_user_id
});

console.log("Connecting to server..");
await client.connect("https://matchmaker.among.us", 443);

console.log("Creating game..");
const code = await client.createGame();

client.myPlayer!.control!.setName("weakeyes");
client.myPlayer!.control!.setColor(skeldjs.Color.Red);

console.log("Created game @ %s", GameCode.convertIntToString(code));
})();
