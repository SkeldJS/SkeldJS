import { SkeldjsClient } from "@skeldjs/client"
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
	
	const follow = "weakeyes";
	
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
    });
})();