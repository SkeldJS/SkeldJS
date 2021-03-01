import { SkeldjsClient, ColorID, MasterServers, HatID } from "@skeldjs/client";
import { SkeldjsPathfinder } from "..";

function getPlayerByName(client: SkeldjsClient, name: string) {
    return [...client.players.values()].find(player => player.data?.name === name);
}

(async () => {
    const client = new SkeldjsClient("2020.11.17.0");
    const pathfinder = new SkeldjsPathfinder(client);

    const server = MasterServers[process.argv[2] as "EU"|"NA"|"AS"][0];
    await client.connect(server[0], server[1]);
    await client.identify("weakeyes");

    await client.joinGame(process.argv[3]);

    client.on("player.spawn", ({ player }) => {
        if (player.isme) {
            client.me.control.checkName("path");
            client.me.control.checkColor(ColorID.Pink);
            client.me.control.setHat(HatID.Flower);

            const stdin = process.openStdin();
            stdin.addListener("data", function (data: Buffer) {
                const str = data.toString().trim();
                const args = str.split(" ");
                const cmd = args.shift();

                switch (cmd) {
                    case "walk": {
                        const player = getPlayerByName(client, args.join(" "));
                        if (player) pathfinder.go(player);
                        break;
                    }
                    case "follow": {
                        const player = getPlayerByName(client, args.join(" "));
                        if (player) pathfinder.follow(player);
                        break;
                    }
                    case "stop": {
                        pathfinder.stop();
                        break;
                    }
                }
            });
        }
    });
})();
