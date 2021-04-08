import * as skeldjs from "..";

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.3.25.0");

    console.log("Connecting..");
    await client.connect("NA", "weakeyes", parseInt(process.argv[2]));

    await client.joinGame(process.argv[3]);
    console.log("Joined game.");

    client.on("player.snapto", ev => {
        console.log(ev.data.player?.data?.name, ev.data.position);
    });

    client.on("player.move", ev => {
        console.log(ev.data.player?.data?.name, ev.data.position);
    });
})();
