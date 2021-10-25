import { Int2Code } from "@skeldjs/util";
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
            map: skeldjs.GameMap.Airship,
            numImpostors: 2,
            killCooldown: 1
        }
    );

    client.on("player.quickchat", ev => {
        console.log(ev.chatMessage);
    });

    console.log(
        "Created game @ " +
            Int2Code(code as number) +
            " on " +
            connectRegion +
            " servers."
    );
})();
