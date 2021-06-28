import * as skeldjs from "@skeldjs/client";
import { Int2Code } from "@skeldjs/util";
import { Color } from "@skeldjs/client";
import { LanDiscovery } from "@skeldjs/lan";

(async () => {
    const lanDiscovery = new LanDiscovery;
    const client = new skeldjs.SkeldjsClient("2021.4.25");

    client.on("client.disconnect", disconnect => {
        console.log("Client disconnected: %s", skeldjs.DisconnectReason[disconnect.reason]);
    });

    console.log("Waiting for game..");
    lanDiscovery.begin();
    const foundGame = await lanDiscovery.wait("discovery.foundgame");

    console.log("Connecting to " + foundGame.ip + "..");
    await client.connect(foundGame.ip, "weakeyes");

    console.log("Joining game..");
    await client.joinGame(foundGame.gameCode);

    console.log("Joined " + Int2Code(client.code) + " @ " + foundGame.ip);

    await client.me?.control?.setName("weakeyes");
    await client.me?.control?.setColor(Color.Blue);
})();
