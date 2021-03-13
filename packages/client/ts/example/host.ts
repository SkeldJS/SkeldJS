import * as skeldjs from "..";

const regcode = process.argv[2];

if (regcode !== "EU" && regcode !== "NA" && regcode !== "AS") {
    console.log(
        "Region must be either EU (Europe), NA (North America) or AS (Asia)."
    );
} else {
    (async () => {
        const client = new skeldjs.SkeldjsClient("2021.3.5.0");

        console.log("Connecting to server..");
        await client.connect(regcode, "weakeyes");

        console.log("Creating game..");
        const code = await client.createGame({
            players: 10,
            map: skeldjs.MapID.TheSkeld,
            impostors: 2,
        });

        client.me.control.setName("poo boy");
        client.me.control.setColor(skeldjs.ColorID.Purple);

        console.log("Created game @ " + code + " on " + regcode + " servers.");
    })();
}
