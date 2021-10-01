import { Int2Code } from "@skeldjs/util";
import { Color, StringNames } from "@skeldjs/constant";
import * as skeldjs from "../index";

const connectRegion = process.argv[2];

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.6.30s", { attemptAuth: false, messageOrdering: true });

    console.log("Connecting to server..");
    await client.connect(connectRegion, "weakeyes");

    client.on("player.join", ev => {
        client.myPlayer?.control?.setName("weakeyes");
        client.myPlayer?.control?.setColor(skeldjs.Color.Red);
        client.setSettings({
            votingTime: 30,
            discussionTime: 0
        });
    });

    console.log("Creating game..");
    const code = await client.createGame(
        {
            maxPlayers: 10,
            map: skeldjs.GameMap.TheSkeld,
            numImpostors: 2,
        }
    );

    client.on("room.endgameintent", ev => {
        if (ev.intentName === "players remaining") {
            ev.cancel();
        }
    });

    client.on("player.quickchat", ev => {
        if (ev.player !== client.myPlayer) {
            client.myPlayer?.control?.sendQuickChat(StringNames.QCQstWhatWasADoing, [ client.myPlayer ]);
        }
    });

    client.on("player.chat", async ev => {
        if (ev.chatMessage === "start") {
            client.startGame();
        } else if (ev.chatMessage === "players") {
            for (let i = 0; i < 2; i++) {
                const playerControl = client.createFakePlayer();
                await playerControl.control?.setName("dummy");
                await playerControl.control?.setColor(Color.Black);
                await client.wait("room.fixedupdate");
            }
        }
    });

    client.on("room.gameend", ev => {
        client.joinGame(client.code);
    });

    console.log(
        "Created game @ " +
            Int2Code(code as number) +
            " on " +
            connectRegion +
            " servers."
    );
})();
