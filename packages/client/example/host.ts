import { Int2Code } from "@skeldjs/util";
import * as skeldjs from "../index";

const regcode = process.argv[2];

if (regcode !== "EU" && regcode !== "NA" && regcode !== "AS") {
    console.log(
        "Region must be either EU (Europe), NA (North America) or AS (Asia)."
    );
} else {
    (async () => {
        const client = new skeldjs.SkeldjsClient("2021.4.2.0");

        console.log("Connecting to server..");
        await client.connect("127.0.0.1", "weakeyes", 0);

        console.log("Creating game..");
        const code = await client.createGame(
            {
                maxPlayers: 10,
                map: skeldjs.GameMap.TheSkeld,
                numImpostors: 2,
            },
            true,
            skeldjs.QuickChatMode.QuickChat
        );

        await client.me?.control?.setName("weakeyes");
        await client.me?.control?.setColor(skeldjs.Color.Red);

        console.log(
            "Created game @ " +
                Int2Code(code as number) +
                " on " +
                regcode +
                " servers."
        );
    })();
}
