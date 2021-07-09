import { QuickChatMode } from "@skeldjs/constant";
import * as skeldjs from "../index";

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.6.30", {
        chatMode: QuickChatMode.QuickChat
    });

    console.log("Connecting..");
    await client.connect(process.argv[2], "weakeyes");

    await client.joinGame(process.argv[3]);
    console.log("Joined game.");

    if (client.host && client.me?.control) {
        await client.me.control.checkColor(skeldjs.Color.Blue);
        await client.me.control.checkName("weakeyes");
    }

    client.host?.on("player.move", (ev) => {
        client.me?.transform?.snapTo(ev.position.x, ev.position.y);
    });

    client.on("player.move", (ev) => {
        console.log(ev.player);
    });
})();
