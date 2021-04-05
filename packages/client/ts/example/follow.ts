import * as skeldjs from "..";

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.3.25.0");

    console.log("Connecting..");
    await client.connect("EU", "weakeyes", 3988070537);

    console.log("Joining game..");
    await client.joinGame("FZZJVF");

    console.log("Joined game.");
})();
