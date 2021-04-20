import * as skeldjs from "../index";

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.3.25.0");

    console.log("Connecting..");
    await client.connect("127.0.0.1", "weakeyes", parseInt(process.argv[2]));

    await client.joinGame(process.argv[3]);
    console.log("Joined game.");

    await client.me.control.checkColor(skeldjs.Color.Blue);
    await client.me.control.checkName("weakeyes");

    client.host.on("player.move", ev => {
        client.me.transform.snapTo(ev.data.position);
    });
})();
