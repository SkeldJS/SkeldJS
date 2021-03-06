import { MessageTag, PlayerData, RpcTag, SpawnID } from "@skeldjs/core";
import { HazelBuffer, sleep } from "@skeldjs/util";

import { SkeldjsServer } from "../lib";
import { Room } from "../lib/Room";

const server = new SkeldjsServer();

server.listen();

function setChat(room: Room, player: PlayerData, vis: boolean) {
    const mh_netid = room.incr_netid;

    room.broadcast([{
        tag: MessageTag.RPC,
        netid: room.gamedata.netid,
        rpcid: RpcTag.UpdateGameData,
        players: [{
            ...player.data,
            dead: vis
        }]
    }, {
        tag: MessageTag.Spawn,
        ownerid: -2,
        type: SpawnID.MeetingHud,
        flags: 0,
        num_components: 1,
        components: [{
            netid: mh_netid,
            data: HazelBuffer.alloc(0)
        }]
    }, {
        tag: MessageTag.RPC,
        netid: mh_netid,
        rpcid: RpcTag.Close
    }, {
        tag: MessageTag.Despawn,
        netid: mh_netid
    }, {
        tag: MessageTag.RPC,
        netid: room.gamedata.netid,
        rpcid: RpcTag.UpdateGameData,
        players: [{
            ...player.data,
            dead: false
        }]
    }], true, player);
}

const prefix = "/";
server.on("player.chat", async (ev, { room, player, message }) => {
    const args = message.split(" ");
    const cmd = args.shift();

    console.log("Got " + message);
    if (cmd === prefix + "hide") {
        await setChat(room, player, false);
        await sleep(5000);
        await setChat(room, player, true);
    }
});
