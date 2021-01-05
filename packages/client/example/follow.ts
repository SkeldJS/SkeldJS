import { SkeldjsClient } from "../ts"
import * as skeldjs from "@skeldjs/common"

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
    
    /*const follow = "weakeyes";
    
    function followPlayer(player) {
        if (player.data?.name === follow) {
            let i = 0;
            setInterval(() => {
                client.room.me.transform.snapTo({
                    x: (Math.sin(i) * 1) + player.transform.position.x,
                    y: (Math.cos(i) * 1) + player.transform.position.y
                });
    
                i += 0.1;
            }, 25);
            const chars = ["a","b","c","d","e"];
            client.room.me.control.checkName("a\nb\nc\nd\ne\f");
        }
    }

    client.on("spawn", (room, owner, component) => {
        if (room === client.room) {
            setTimeout(() => {
                followPlayer(component.owner);
            }, 1000);
        }
    });*/
    
    client.room.on("meeting", (control: skeldjs.PlayerControl, player: skeldjs.PlayerData) => {
        const players = [...client.room.players.values()];

        const impostors = players.filter(player => {
            return player.data.impostor;
        }).map(player => {
            return player.data.name;
        });

        const impostors_fmt = impostors.length === 1 ? impostors[0] : impostors.slice(0, impostors.length - 1).join(", ") + " and " + impostors[impostors.length - 1];

        setTimeout(() => {
            client.room.me.control.chat("Hey, I just voted " + impostors_fmt + " because I saw them vent");// " + (impostors.length > 1 ? "s" : ""));
            
            client.room.meetinghud.castVote(client.room.me, control);
        }, (client.room.settings.discussionTime * 1000) + 3000);
    });

    client.room.me.once("spawn", () => {
        setTimeout(() => {
            client.room.me.control.checkName("human man");
            client.room.me.control.checkColor(skeldjs.ColorID.Cyan);
        }, 500);
    });
})();