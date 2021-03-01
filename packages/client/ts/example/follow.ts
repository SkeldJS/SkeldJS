import * as skeldjs from "..";

const server = skeldjs.MasterServers.NA[1];

(async () => {
    const client = new skeldjs.SkeldjsClient("2020.11.17.0");

    console.log("Connecting..");
    await client.connect(server[0], server[1]);

    console.log("Identifying..");
    await client.identify("weakeyes");

    console.log("Joining game..");

    await client.joinGame(process.argv[2]);

    client.me.on("player.spawn", async () => {
        await client.me.control.checkName("poo head");
        await client.me.control.checkColor(skeldjs.ColorID.Brown);
    });
})();
