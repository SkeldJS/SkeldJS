import * as skeldjs from "..";

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.3.5.0");

    console.log("Connecting..");
    await client.connect("EU", "weakeyes");

    console.log("Joining game..");
    await client.joinGame(process.argv[2]);

    client.me.on("player.spawn", async () => {
        await client.me.control.checkName("poo head");
        await client.me.control.checkColor(skeldjs.ColorID.Brown);
    });
})();
