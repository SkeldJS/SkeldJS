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
            killCooldown: 1
        }
    );

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

    client.on("gamedata.settasks", ev => {
        ev.setTasks([...ev.newTasks, 4]);
    });

    client.on("room.gameend", ev => {
        client.joinGame(client.code);
    });

    client.on("medscan.joinqueue", ev => {
        console.log(ev.player.info?.name, "joined med scan queue");
    });

    client.on("medscan.leavequeue", ev => {
        console.log(ev.player.info?.name, "left med scan queue");
    });

    console.log(
        "Created game @ " +
            Int2Code(code as number) +
            " on " +
            connectRegion +
            " servers."
    );
})();
