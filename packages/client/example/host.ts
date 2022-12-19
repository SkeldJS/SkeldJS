import { GameCode } from "@skeldjs/util";
import * as skeldjs from "../index";
import { AuthMethod, EosHttpApi, QuickChatMode } from "../index";

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
        deploymentId: "503cd077a7804777aee5a6eeb5cfe62d",
        nonce: Math.random().toString(16).substring(2),
        displayName: "edqxr",
        externalAuthToken: access_token
    });

    const client = new skeldjs.SkeldjsClient("2022.11.1.0s", "weakeyes", {
        authMethod: AuthMethod.SecureTransport,
        useHttpMatchmaker: true,
        idToken: account.id_token,
        eosProductUserId: account.product_user_id,
        chatMode: QuickChatMode.FreeChat
    });

    console.log("Connecting to server..");
    await client.connect("https://matchmaker-eu.among.us", 443);

    console.log("Creating game..");
    const code = await client.joinGame("DTOQQQ");

    client.myPlayer!.control!.setName("weakeyes");
    client.myPlayer!.control!.setColor(skeldjs.Color.Red);

    console.log("Created game @ %s", GameCode.convertIntToString(code));
})();
