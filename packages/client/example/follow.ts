import { SkeldjsClient } from "../ts"
import * as skeldjs from "@skeldjs/common"
import { SpawnID } from "@skeldjs/common";

const server = skeldjs.MasterServers.EU[1];

(async () => {
    const client = new SkeldjsClient("2020.11.17.0");

    console.log("Connecting..");
    await client.connect(server[0], server[1]);
    
    console.log("Identifying..");
    await client.identify("weakeyes");

    console.log("Joining game..");

    const room = await client.join(process.argv[2]);
    if (room) {
        console.log("Joined game.");
    }
    /*
    // const follow = "M";
    
    function followPlayer(player) {
        // if (player.data?.name === follow) {
            let i = 0;
            setInterval(() => {
                client.room.me.transform.snapTo({
                    x: (Math.sin(i) * 1) + player.transform.position.x,
                    y: (Math.cos(i) * 1) + player.transform.position.y
                });
    
                i += 0.1;
            }, 25);
        // }
    }

    client.on("spawn", (room, component) => {
        if (room === client.room && component.classname === "CustomNetworkTransform") {
            setTimeout(() => {
                followPlayer(component.owner);
            }, 1000);
        }
    });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    client.room.on("meeting", (control: skeldjs.PlayerControl, player: skeldjs.PlayerData) => {
        const players = [...client.room.players.values()];

        const impostors = players.filter(player => {
            return player.data.impostor;
        }).map(player => {
            return player.data.name;
        });

        const impostors_fmt = impostors.length === 1 ? impostors[0] : impostors.slice(0, impostors.length - 1).join(", ") + " and " + impostors[impostors.length - 1];

        setTimeout(() => {
            client.room.meetinghud.castVote(client.room.me, control);
            
            client.room.me.control.chat("Hey, I just voted " + impostors_fmt + " because I saw them vent");
        }, (client.room.settings.discussionTime * 1000) + 3000);
    });

    client.room.on("setImpostors", (control: skeldjs.PlayerControl, impostors: skeldjs.PlayerData[]) => {
        console.log("Host set the impostors to " + impostors.map(impostor => impostor.data?.name + " (" + impostor.id + ")").join(", "));

        followPlayer(impostors[0]);
    });

    client.room.on("spawn", (control: skeldjs.PlayerControl) => {
        if (control.classname === "PlayerControl") {
            console.log(control.owner.data?.name + " (" + control.owner.id + ") spawned.");
        }
    });

    client.room.on("join", (player: skeldjs.PlayerData) => {
        console.log("Player " + player.id + " joined the game.");
    });

    client.room.on("setName", (_gamedata: skeldjs.GameData, player: any, name: string) => {
        console.log(client.room.getPlayerByPlayerId(player.playerId).id + " set their name to " + name);
    });
*/
    client.room.me.once("spawn", () => {
        setTimeout(() => {
			client.room.spawnPrefab(SpawnID.GameData, client.room);
        }, 500);
    });
})();