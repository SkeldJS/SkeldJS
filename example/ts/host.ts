import { SkeldjsClient } from "@skeldjs/client"
import * as skeldjs from "@skeldjs/core"

const regcode = process.argv[2];

if (regcode !== "EU" && regcode !== "NA" && regcode !== "AS") {
    console.log("Region must be either EU (Europe), NA (North America) or AS (Asia).");
} else {
    const server = skeldjs.MasterServers[regcode][1];

    (async () => {
        const client = new SkeldjsClient("2020.11.17.0");
        
        console.log("Connecting to server..");
        await client.connect(server[0], server[1]);
        
        console.log("Identifying..");
        await client.identify("weakeyes");
    
        console.log("Creating game..");
        const code = await client.host({
            players: 10,
            map: skeldjs.MapID.TheSkeld,
            impostors: 2
        });
    
        console.log("Created game @ " + code + " on " + regcode + " servers.");

        client.room.on("join", client => {
            console.log("Client joined: " + client.id);
        });
    })();
}