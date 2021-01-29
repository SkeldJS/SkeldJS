import * as skeldjs from "..";

const server = skeldjs.MasterServers.EU[1];

(async () => {
    const client = new skeldjs.SkeldjsClient("2020.11.17.0");

    console.log("Connecting..");
    await client.connect(server[0], server[1]);

    console.log("Identifying..");
    await client.identify("weakeyes");

    console.log("Joining game..");

    const room = await client.join(process.argv[2]);

    if (room)
        console.log("Joined game.");

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
        }
    }

    client.on("spawn", (room, component) => {
        if (room === client.room && component.classname === "CustomNetworkTransform") {
            setTimeout(() => {
                followPlayer(component.owner);
            }, 1000);
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    client.room.on("meeting", (control) => {
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

    client.room.on("setImpostors", (control, impostors) => {
        console.log("Host set the impostors to " + impostors.map(impostor => impostor.data?.name + " (" + impostor.id + ")").join(", "));

        followPlayer(impostors[0]);
    });

    client.room.on("spawn", (component) => {
        if (component.classname === "PlayerControl") {
            console.log(component.owner.data?.name + " (" + component.owner.id + ") spawned.");
        }
    });

    client.room.on("join", (player) => {
        console.log("Player " + player.id + " joined the game.");
    });

    client.room.on("setName", (control, name) => {
        console.log(control.owner.id + " set their name to " + name);
    });

    client.room.on("spawn", (component) => {
        if (component.owner === client.room.me && component.classname === "PlayerControl") {
            component.checkName("bumole");
            component.checkColor(skeldjs.ColorID.Brown);
        }
    });
})();
