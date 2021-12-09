import { Int2Code } from "@skeldjs/util";
import { QuickChatMode, RoleType } from "@skeldjs/constant";
import * as skeldjs from "../index";

const connectRegion = skeldjs.OfficialServers[process.argv[2] as keyof typeof skeldjs.OfficialServers] || process.argv[2];

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.11.9.0s", {
        authMethod: skeldjs.AuthMethod.SecureTransport,
        chatMode: QuickChatMode.FreeChat
    });

    console.log("Connecting to server..");
    await client.connect(connectRegion, "weakeyes", undefined);

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
            Int2Code(code as number) +
            " on " +
            connectRegion +
            " servers."
    );
})();
