import { SystemType } from "@skeldjs/constant";
import * as skeldjs from "..";

const regcode = process.argv[2];

if (regcode !== "EU" && regcode !== "NA" && regcode !== "AS") {
    console.log("Region must be either EU (Europe), NA (North America) or AS (Asia).");
} else {
    const server = skeldjs.MasterServers[regcode][1];

    (async () => {
        const client = new skeldjs.SkeldjsClient("2020.11.17.0");

        console.log("Connecting to server..");
        await client.connect(server[0], server[1]);

        console.log("Identifying..");
        await client.identify("weakeyes");

        console.log("Creating game..");
        const code = await client.createGame({
            players: 10,
            map: skeldjs.MapID.MiraHQ,
            impostors: 2
        });

        console.log("Created game @ " + code + " on " + regcode + " servers.");

        client.on("o2.consoles.complete", ({ player, consoleId }) => {
            console.log("Player " + player.data?.name + " completed console " + consoleId + ".");
        });

        client.on("o2.consoles.clear", () => {
            console.log("All o2 consoles were cleared.")
        });

        client.on("system.sabotage", ({ player, system }) => {
            if (system.systemType === SystemType.O2) {
                console.log("Player " + player.data?.name + " sabotaged oxygen.");
            } else if (system.systemType === SystemType.Communications) {
                setTimeout(() => system.fix(), 5000);
            }
        });

        client.on("system.repair", ({ player, system }) => {
            if (system.systemType === SystemType.O2) {
                console.log("Player " + player.data?.name + " repaired oxygen.");
            }
        });

        client.on("player.join", ({ player }) => {
            player.on("component.spawn", ({ component }) => {
                if (component.classname === "CustomNetworkTransform") {
                    client.startGame();
                }
            });
        });

        client.on("hqhud.consoles.reset", () => {
            console.log("Headquarters consoles were reset.");
        });

        client.on("hqhud.consoles.open", () => {
            console.log("A console was opened.");
        });

        client.on("hqhud.consoles.close", () => {
            console.log("A console was closed.");
        });

        client.on("hqhud.consoles.complete", () => {
            console.log("A console was completed.");
        });
    })();
}
