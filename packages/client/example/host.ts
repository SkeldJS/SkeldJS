import { Int2Code } from "@skeldjs/util";
import { StringNames } from "@skeldjs/constant";
import * as skeldjs from "../index";

const connectRegion = process.argv[2];

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.6.30s", { attemptAuth: false, messageOrdering: true });

    console.log("Connecting to server..");
    await client.connect(connectRegion, "weakeyes");

    console.log("Creating game..");
    const code = await client.createGame(
        {
            maxPlayers: 10,
            map: skeldjs.GameMap.TheSkeld,
            numImpostors: 2,
        }
    );

    await client.myPlayer?.control?.setName("weakeyes");
    await client.myPlayer?.control?.setColor(skeldjs.Color.Red);

    client.on("player.quickchat", ev => {
        if (ev.player !== client.myPlayer) {
            client.myPlayer?.control?.sendQuickChat(StringNames.QCQstWhatWasADoing, [ client.myPlayer ]);
        }
    });

    console.log(
        "Created game @ " +
            Int2Code(code as number) +
            " on " +
            connectRegion +
            " servers."
    );
})();
