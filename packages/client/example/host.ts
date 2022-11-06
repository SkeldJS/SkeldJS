import { GameCode } from "@skeldjs/util";
import { RoleType } from "@skeldjs/constant";
import * as skeldjs from "../index";
import { AuthMethod, EosHttpApi } from "../index";

const connectRegion = skeldjs.OfficialServers[process.argv[2] as keyof typeof skeldjs.OfficialServers] || process.argv[2];

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
    await client.connect(connectRegion, 443);

    console.log("Creating game..");
    const code = await client.createGame(
        {
            maxPlayers: 15,
            map: skeldjs.GameMap.TheSkeld,
            numImpostors: 2,
            killCooldown: 1,
            votingTime: 30,
            discussionTime: 0,
            roleSettings: {
                roleChances: {
                    [RoleType.Shapeshifter]: {
                        chance: 100,
                        maxPlayers: 1
                    }
                },
                shapeshiftDuration: 20,
                shapeshifterLeaveSkin: true,
                shapeshifterCooldown: 10
            }
        }
    );

    client.myPlayer!.control!.setName("weakeyes");
    client.myPlayer!.control!.setColor(skeldjs.Color.Red);

    client.on("player.chat", ev => {
        client.setSettings({
            keywords: 69
        });
    });

    console.log(
        "Created game @ " +
            GameCode.convertIntToString(code) +
            " on " +
            connectRegion +
            " servers."
    );
})();
