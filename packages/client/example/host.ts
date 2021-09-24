import { Int2Code } from "@skeldjs/util";
import { GameOverReason } from "../../constant";
import * as skeldjs from "../index";

const connectRegion = process.argv[2];

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.6.30s", { attemptAuth: false });

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

    client.registerEndGameIntent("balls", () => {
        for (const [ , player ] of client.players) {
            if (player.transform.position.x < -5) {
                return GameOverReason.ImpostorByKill;
            }
        }
    });

    client.on("room.selectimpostors", select => {
        select.setImpostors([ client.myPlayer! ]);
    });

    client.on("player.chat", chat => {
        if (chat.chatMessage === "/start") {
            client.startGame();
        }
    });

    client.on("room.endgameintent", intent => {
        if (intent.intentName === "players remaining") {
            intent.cancel();
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
