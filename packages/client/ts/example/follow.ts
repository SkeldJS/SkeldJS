import { ColorID, MessageTag, RpcTag } from "@skeldjs/constant";
import * as skeldjs from "..";

(async () => {
    const client = new skeldjs.SkeldjsClient("2021.3.25.0");

    console.log("Connecting..");
    await client.connect("EU", "weakeyes", parseInt(process.argv[2]));

    client.on("player.spawn", ev => {
        if (ev.data.player !== client.me)
            return;

        console.log("Spawned.");
        client.me.control.checkColor(ColorID.Blue);
        client.me.control.checkName("poop");

        setTimeout(() => {
            client.broadcast([
                {
                    tag: MessageTag.RPC,
                    netid: client.me.control.netid,
                    rpcid: RpcTag.SendChat,
                    message: "poo baby"
                }
            ], true, client.host);
        }, 2000);
    });

    await client.joinGame(process.argv[3]);
    console.log("Joined game.");
})();
