import * as skeldjs from "@skeldjs/client";
import { Int2Code } from "@skeldjs/util";

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.4.25");

    client.on("client.disconnect", disconnect => {
        console.log("Client disconnected: %s", skeldjs.DisconnectReason[disconnect.reason]);
    });

    console.log("Connecting to " + process.argv[2] + "..");
    await client.connect(process.argv[2], "weakeyes");

    console.log("Creating game..");
    await client.createGame({
        map: skeldjs.GameMap.TheSkeld,
        keywords: skeldjs.GameKeyword.English,
        numImpostors: 2
    });

    console.log("Joined " + Int2Code(client.code) + " @ " + process.argv[2]);
    await client.me?.control?.setName("weakeye");
    await client.me?.control?.setColor(skeldjs.Color.Blue);

    client.on("meeting.castvote", ev => {
        ev.revert();
    });

    process.stdin.resume();

    process.stdin.on("data", async buffer => {
        const data = buffer.toString("utf8").trim();

        const args = data.split(" ");
        const cmd = args.shift();

        if (cmd === "/start") {
            await client.requestStartGame();
            await client.wait("room.game.start");
        }
    });
})();
