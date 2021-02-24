import { SkeldjsClient, ColorID, MasterServers } from "@skeldjs/client";
import { SkeldjsPathfinder } from "..";

(async () => {
    const client = new SkeldjsClient("2020.11.17.0");
    const pathfinder = new SkeldjsPathfinder(client);

    const server = MasterServers[process.argv[2] as "EU"|"NA"|"AS"][0];
    await client.connect(server[0], server[1]);
    await client.identify("weakeyes");

    await client.joinGame(process.argv[3]);

    client.on("component.spawn", ({ component }) => {
        if (component.classname === "CustomNetworkTransform" && component.ownerid === client.clientid) {
            client.room.me.control.checkName("path");
            client.room.me.control.checkColor(ColorID.Blue);

            component.on("player.move", ({ position }) => {
                console.log("X: " + position.x.toFixed(5) + ", Y: " + position.y.toFixed(5));
            });

            const stdin = process.openStdin();
            stdin.addListener("data", function (data: Buffer) {
                const str = data.toString().trim();
                const args = str.split(" ");
                const cmd = args.shift();

                if (cmd === "walk") {
                    const found = [...client.room.players.values()].find(player => player.data?.name === args.join(" "));
                    if (found) {
                        pathfinder.go(found);
                    }
                } else if (cmd === "follow") {
                    const found = [...client.room.players.values()].find(player => player.data?.name === args.join(" "));
                    if (found) {
                        pathfinder.follow(found);
                    }
                } else if (cmd === "stop") {
                    pathfinder.stop();
                }
            });
        }
    });
})();
