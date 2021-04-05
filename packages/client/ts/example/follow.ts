import * as skeldjs from "..";

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.3.25.0");

    console.log("Connecting..");
    await client.connect("EU", "weakeyes");

    console.log("Joining game..");
    await client.joinGame("COTSBF");

    console.log("Joined game.");
})();
