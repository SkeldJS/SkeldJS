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
        deploymentId: "3ce14d8292084c80a8364a8b5f0dfbf4",
        nonce: Math.random().toString(16).substring(2),
        displayName: "edqxr",
        externalAuthToken: access_token
    });

    const client = new skeldjs.SkeldjsClient("2023.5.20.0s", "weakeyes", {
        authMethod: AuthMethod.SecureTransport,
        useHttpMatchmaker: true,
        idToken: account.id_token,
        eosProductUserId: account.product_user_id,
        chatMode: QuickChatMode.FreeChat
    });

    console.log("Connecting to server..");
    await client.connect("https://matchmaker-eu.among.us", 443);

    console.log("Creating game..");
    const code = await client.createGame({ maxPlayers: 15 });
    console.log("Join @ %s", GameCode.convertIntToString(code));

    // console.log(await client.joinGame(process.argv[2]));

    await client.myPlayer?.control?.checkName("Edward");
    await client.myPlayer?.control?.checkColor(skeldjs.Color.Blue);
    await client.myPlayer?.control?.setName("Edward");
    await client.myPlayer?.control?.setColor(skeldjs.Color.Blue);
    await client.myPlayer?.control?.setHat(skeldjs.Hat.NoHat);
    await client.myPlayer?.control?.setSkin(skeldjs.Skin.None);
    await client.myPlayer?.control?.setPet(skeldjs.Pet.EmptyPet);
    await client.myPlayer?.control?.setNameplate(skeldjs.Nameplate.NoPlate);
    await client.myPlayer?.control?.setVisor(skeldjs.Visor.EmptyVisor);

    client.on("player.chat", ev => {
        if (ev.chatMessage === "/init") {
            for (let i = 0; i < 5; i++) {
                client.createFakePlayer(true);
            }
        } else if (ev.chatMessage === "/start") {
            client.startGame();
        }
    });

    client.on("client.disconnect", ev => {
        console.log(ev);
    });
})();
