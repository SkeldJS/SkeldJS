import { HazelBuffer, sleep } from "@skeldjs/util";
import * as skeldjs from "..";

const regcode = process.argv[2];

function setChat(client: skeldjs.SkeldjsClient, player: skeldjs.PlayerData, vis: boolean) {
    const mh_netid = client.incr_netid;

    client.broadcast([{
        tag: skeldjs.MessageTag.RPC,
        netid: client.gamedata.netid,
        rpcid: skeldjs.RpcTag.UpdateGameData,
        players: [{
            ...player.data,
            dead: vis
        }]
    }, {
        tag: skeldjs.MessageTag.Spawn,
        ownerid: -2,
        type: skeldjs.SpawnID.MeetingHud,
        flags: 0,
        num_components: 1,
        components: [{
            netid: mh_netid,
            data: HazelBuffer.alloc(0)
        }]
    }, {
        tag: skeldjs.MessageTag.RPC,
        netid: mh_netid,
        rpcid: skeldjs.RpcTag.Close
    }, {
        tag: skeldjs.MessageTag.Despawn,
        netid: mh_netid
    }, {
        tag: skeldjs.MessageTag.RPC,
        netid: client.gamedata.netid,
        rpcid: skeldjs.RpcTag.UpdateGameData,
        players: [{
            ...player.data,
            dead: false
        }]
    }], true, player);
}

const prefix = "/";

if (regcode !== "EU" && regcode !== "NA" && regcode !== "AS") {
    console.log(
        "Region must be either EU (Europe), NA (North America) or AS (Asia)."
    );
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
            map: skeldjs.MapID.Airship,
            impostors: 2,
        });

        client.me.control.setName("poo boy");
        client.me.control.setColor(skeldjs.ColorID.Purple);

        console.log("Created game @ " + code + " on " + regcode + " servers.");

        client.on("player.spawn", async () => {
            await sleep(5000);
            client.me.control.chat("I HATE ROBSCOB");
        });
    })();
}
