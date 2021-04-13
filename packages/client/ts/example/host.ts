import { Int2Code } from "@skeldjs/util";
import * as skeldjs from "..";

const regcode = process.argv[2];

if (regcode !== "EU" && regcode !== "NA" && regcode !== "AS") {
    console.log(
        "Region must be either EU (Europe), NA (North America) or AS (Asia)."
    );
} else {
    (async () => {
        const client = new skeldjs.SkeldjsClient("2021.4.2.0");

        console.log("Connecting to server..");
        await client.connect(regcode, "weakeyes", 4324);

        console.log("Creating game..");
        const code = await client.createGame({
            players: 10,
            map: skeldjs.MapID.TheSkeld,
            impostors: 2
        });

        console.log("Created game @ " + Int2Code(code as number) + " on " + regcode + " servers.");
    })();
}
