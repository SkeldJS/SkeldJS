import * as skeldjs from "..";

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.3.25.0");

    console.log("Connecting..");
    await client.connect("EU", "weakeyes", 3988070537);

    console.log("Joining game..");
    await client.joinGame("VVGJZF", false);

    client.on("component.spawn", ev => {
        console.log(ev.data.component.classname);
    });
    await client.spawnSelf();

    console.log("Joined game.");
})();
