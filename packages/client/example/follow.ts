import { QuickChatMode } from "@skeldjs/constant";
import * as skeldjs from "../index";

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.6.30", {
        chatMode: QuickChatMode.FreeChat
    });

    console.log("Connecting..");
    await client.connect(process.argv[2], "weakeyes");

    console.log("Joining game..");
    await client.joinGame(process.argv[3]);
    console.log("Joined game.");

    if (client.host && client.myPlayer?.control) {
        await client.myPlayer.control.checkColor(skeldjs.Color.Blue);
        await client.myPlayer.control.checkName("weakeyes");
    }

    client.on("doors.close", ev => {
        console.log(ev.doorsystem.constructor.name, ev.door.id);
    });
})();
