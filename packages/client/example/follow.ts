import { QuickChatMode } from "@skeldjs/constant";
import * as skeldjs from "../index";

(async () => {
    const client = new skeldjs.SkeldjsClient("2022.2.2.0", "weakeyes", {
        chatMode: QuickChatMode.FreeChat
    });

    console.log("Connecting..");
    await client.connect("https://matchmaker.among.us", 22023);

    console.log("Joining game..");
    await client.joinGame(process.argv[3]);
    console.log("Joined game.");

    if (client.host && client.myPlayer?.control) {
        await client.myPlayer.control.checkColor(skeldjs.Color.Blue);
        await client.myPlayer.control.checkName("weakeyes");
    }
})();
