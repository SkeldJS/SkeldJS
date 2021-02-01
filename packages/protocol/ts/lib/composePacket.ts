import {
    DisconnectReason,
    MessageTag,
    Opcode,
    PayloadTag,
    RpcTag
} from "@skeldjs/constant"

import {
    HazelBuffer,
    writeVector2
} from "@skeldjs/util"

import {
    GameOptions
} from "./misc"

import {
    Packet,
    ClientboundPacket,
    ServerboundPacket
} from "./packets";

export function composeOptions(options: GameOptions) {
    const writer = HazelBuffer.alloc(0);
    writer.uint8(options.version);
    writer.uint8(options.players);
    writer.int32(options.language);
    writer.uint8(options.map);
    writer.float(options.playerSpeed);
    writer.float(options.crewmateVision);
    writer.float(options.impostorVision);
    writer.float(options.killCooldown);
    writer.uint8(options.commonTasks);
    writer.uint8(options.longTasks);
    writer.uint8(options.shortTasks);
    writer.uint32(options.emergencies);
    writer.uint8(options.impostors);
    writer.uint8(options.killDistance);
    writer.uint32(options.discussionTime);
    writer.uint32(options.votingTime);
    writer.bool(options.isDefaults);

    if (options.version !== 1) {
        writer.uint8(options.emergencyCooldown);

        if (options.version !== 2) {
            writer.bool(options.confirmEjects);
            writer.bool(options.visualTasks);

            if (options.version !== 3) {
                writer.bool(options.anonymousVotes);
                writer.uint8(options.taskbarUpdates);
            }
        }
    }

    return writer;
}

export function composePacket(packet: ClientboundPacket, bound?: "client"): HazelBuffer;
export function composePacket(packet: ServerboundPacket, bound?: "server"): HazelBuffer;
export function composePacket(packet: Packet, bound: "server"|"client" = "server"): HazelBuffer {
    packet.bound = bound;

    const writer = HazelBuffer.alloc(512);

    writer.uint8(packet.op);

    switch (packet.op) {
    case Opcode.Reliable:
        writer.uint16(packet.nonce, "be");
    case Opcode.Unreliable:
        for (let i = 0; i < packet.payloads.length; i++) {
            const payload = packet.payloads[i];
            payload.bound = packet.bound;

            writer.message(payload.tag);
            switch (payload.tag) {
            case PayloadTag.HostGame:
                if (payload.bound === "client") {
                    writer.int32(payload.code);
                } else {
                    const owriter = composeOptions(payload.settings);
                    writer.upacked(owriter.size);
                    writer.buf(owriter);
                }
                break;
            case PayloadTag.JoinGame:
                if (payload.bound === "client") {
                    if (payload.error) {
                        writer.uint32(payload.reason);
                    } else if (payload.error === false) { // '===' false for type inference
                        writer.int32(payload.code);
                        writer.uint32(payload.clientid);
                        writer.uint32(payload.hostid);
                    }
                } else {
                    writer.int32(payload.code);
                    writer.byte(payload.mapOwnership);
                }
                break;
            case PayloadTag.StartGame:
                writer.int32(payload.code);
                break;
            case PayloadTag.RemoveGame:
                writer.uint8(payload.reason);
                break;
            case PayloadTag.RemovePlayer:
                writer.int32(payload.code);

                if (payload.bound === "client") {
                    writer.uint32(payload.clientid);
                    writer.uint32(payload.hostid);
                } else {
                    writer.upacked(payload.clientid);
                }

                writer.uint8(payload.reason);
                break;
            case PayloadTag.GameData:
            case PayloadTag.GameDataTo:
                writer.int32(payload.code);

                if (payload.tag === PayloadTag.GameDataTo) {
                    writer.upacked(payload.recipientid);
                }

                for (let i = 0; i < payload.messages.length; i++) {
                    const message = payload.messages[i];

                    writer.message(message.tag);

                    switch (message.tag) {
                    case MessageTag.Data:
                        writer.upacked(message.netid);
                        writer.buf(message.data);
                        break;
                    case MessageTag.RPC:
                        writer.upacked(message.netid);
                        writer.uint8(message.rpcid);

                        switch (message.rpcid) {
                        case RpcTag.PlayAnimation:
                            writer.uint8(message.task);
                            break;
                        case RpcTag.CompleteTask:
                            writer.upacked(message.taskIdx);
                            break;
                        case RpcTag.SyncSettings:
                            const owriter = composeOptions(message.settings);
                            writer.upacked(owriter.size);
                            writer.buf(owriter);
                            break;
                        case RpcTag.SetInfected:
                            writer.upacked(message.impostors.length);
                            for (let i = 0; i < message.impostors.length; i++) {
                                writer.uint8(message.impostors[i]);
                            }
                            break;
                        case RpcTag.Exiled:
                            break;
                        case RpcTag.CheckName:
                            writer.string(message.name);
                            break;
                        case RpcTag.SetName:
                            writer.string(message.name);
                            break;
                        case RpcTag.CheckColor:
                            writer.uint8(message.color);
                            break;
                        case RpcTag.SetColor:
                            writer.uint8(message.color);
                            break;
                        case RpcTag.SetHat:
                            writer.upacked(message.hat);
                            break;
                        case RpcTag.SetSkin:
                            writer.upacked(message.skin);
                            break;
                        case RpcTag.ReportDeadBody:
                            writer.uint8(message.bodyid);
                            break;
                        case RpcTag.MurderPlayer:
                            writer.uint8(message.victimid);
                            break;
                        case RpcTag.SendChat:
                            writer.string(message.message);
                            break;
                        case RpcTag.StartMeeting:
                            writer.uint8(message.bodyid);
                            break;
                        case RpcTag.SetScanner:
                            writer.bool(message.scanning);
                            writer.uint8(message.count);
                            break;
                        case RpcTag.SendChatNote:
                            writer.uint8(message.playerid);
                            writer.uint8(message.type);
                            break;
                        case RpcTag.SetPet:
                            writer.upacked(message.pet);
                            break;
                        case RpcTag.SetStartCounter:
                            writer.upacked(message.seqId);
                            writer.int8(message.time);
                            break;
                        case RpcTag.EnterVent:
                            writer.upacked(message.ventid);
                            break;
                        case RpcTag.ExitVent:
                            writer.upacked(message.ventid);
                            break;
                        case RpcTag.SnapTo:
                            writeVector2(writer, message.position);
                            writer.uint16(message.seqId);
                            break;
                        case RpcTag.Close:
                            break;
                        case RpcTag.VotingComplete:
                            writer.upacked(message.states.length);
                            for (let i = 0; i < message.states.length; i++) {
                                writer.byte(message.states[i]);
                            }
                            writer.uint8(message.exiled);
                            writer.bool(message.tie);
                            break;
                        case RpcTag.CastVote:
                            writer.uint8(message.votingid);
                            writer.uint8(message.suspectid);
                            break;
                        case RpcTag.ClearVote:
                            break;
                        case RpcTag.AddVote:
                            writer.uint32(message.votingid);
                            writer.uint32(message.targetid);
                            break;
                        case RpcTag.CloseDoorsOfType:
                            writer.uint8(message.systemid);
                            break;
                        case RpcTag.RepairSystem:
                            writer.uint8(message.systemid);
                            writer.upacked(message.repairerid);
                            writer.uint8(message.value);
                            break;
                        case RpcTag.SetTasks:
                            writer.uint8(message.playerid);
                            writer.upacked(message.taskids.length);
                            for (let i = 0; i < message.taskids.length; i++) {
                                writer.upacked(message.taskids[i]);
                            }
                            break;
                        case RpcTag.UpdateGameData:
                            for (let i = 0; i < message.players.length; i++) {
                                const player = message.players[i];
                                writer.message(player.playerId);
                                writer.string(player.name);
                                writer.uint8(player.color);
                                writer.upacked(player.hat);
                                writer.upacked(player.pet);
                                writer.upacked(player.skin);
                                writer.byte(
                                    (player.disconnected ? 1 : 0) |
                                    (player.impostor ? 2 : 0) |
                                    (player.dead ? 4 : 0)
                                );
                                writer.uint8(player.tasks.length);
                                for (let i = 0; i < player.tasks.length; i++) {
                                    const task = player.tasks[i];

                                    writer.upacked(task.taskIdx);
                                    writer.bool(task.completed);
                                }
                                writer.end();
                            }
                            break;
                        }
                        break;
                    case MessageTag.Spawn:
                        writer.upacked(message.type);
                        writer.upacked(message.ownerid);
                        writer.byte(message.flags);

                        writer.upacked(typeof message.num_components === "undefined" ? message.components.length : message.num_components);
                        for (let i = 0; i < message.components.length; i++) {
                            const component = message.components[i];
                            writer.upacked(component.netid);
                            writer.message(0);
                            writer.buf(component.data);
                            writer.end();
                        }
                        break;
                    case MessageTag.Despawn:
                        writer.upacked(message.netid);
                        break;
                    case MessageTag.SceneChange:
                        writer.upacked(message.clientid);
                        writer.string(message.scene);
                        break;
                    case MessageTag.Ready:
                        writer.upacked(message.clientid);
                        break;
                    case MessageTag.ChangeSettings:
                        break;
                    }

                    writer.end();
                }
                break;
            case PayloadTag.JoinedGame:
                writer.int32(payload.code);
                writer.uint32(payload.clientid);
                writer.uint32(payload.hostid);
                writer.upacked(payload.clients.length);
                for (let i = 0; i < payload.clients.length; i++) {
                    writer.upacked(payload.clients[i]);
                }
                break;
            case PayloadTag.EndGame:
                writer.int32(payload.code);
                writer.uint8(payload.reason);
                writer.bool(payload.show_ad);
                break;
            case PayloadTag.GetGameList:
                break;
            case PayloadTag.AlterGame:
                writer.int32(payload.code);
                writer.uint8(payload.alter_tag);
                writer.uint8(payload.value);
                break;
            case PayloadTag.KickPlayer:
                writer.int32(payload.code);
                writer.upacked(payload.clientid);
                writer.bool(payload.banned);

                if (typeof payload.reason === "number") {
                    writer.uint8(payload.reason);
                }
                break;
            case PayloadTag.WaitForHost:
                writer.int32(payload.code);
                writer.uint32(payload.clientid);
                break;
            case PayloadTag.Redirect:
                writer.ip(payload.ip);
                writer.uint16(payload.port);
                break;
            case PayloadTag.MasterServerList:
                writer.uint8(0x01);
                writer.upacked(payload.servers.length);
                for (let i = 0; i < payload.servers.length; i++) {
                    const server = payload.servers[i];

                    writer.message(0);
                    writer.string(server.name);
                    writer.ip(server.ip);
                    writer.uint16(server.port);
                    writer.upacked(server.players);
                    writer.end();
                }
                break;
            case PayloadTag.GetGameListV2:
                if (payload.bound === "server") {
                    writer.upacked(0x00);
                    composeOptions(payload.options);
                } else {
                    if (payload.counts) {
                        writer.message(1);
                        writer.uint32(payload.counts.theskeld);
                        writer.uint32(payload.counts.mirahq);
                        writer.uint32(payload.counts.polus);
                        writer.end();
                    }

                    writer.message(0);
                    for (let i = 0; i < payload.games.length; i++) {
                        const game = payload.games[i];

                        writer.message(0);
                        writer.ip(game.ip);
                        writer.uint16(game.port);
                        writer.int32(game.code);
                        writer.string(game.name);
                        writer.uint8(game.players);
                        writer.upacked(game.age);
                        writer.uint8(game.map);
                        writer.uint8(game.impostors);
                        writer.uint8(game.max_players);
                        writer.end();
                    }
                    writer.end();
                }

                break;
            }
            writer.end();
        }
        break;
    case Opcode.Hello:
        writer.expand(8 + packet.username.length);

        writer.uint16(packet.nonce, "be");
        writer.uint8(packet.hazelver);
        writer.int32(packet.clientver);
        writer.string(packet.username);
        break;
    case Opcode.Disconnect:
        if (typeof packet.show_reason === "boolean") {
            writer.bool(packet.show_reason);

            if (typeof packet.reason === "number") {
                writer.message(0);
                writer.uint8(packet.reason);

                if (packet.reason === DisconnectReason.Custom && typeof packet.message === "string") {
                    writer.string(packet.message);
                }
                writer.end();
            }
        }
        break;
    case Opcode.Acknowledge:
        writer.uint16(packet.nonce, "be");
        writer.byte(packet.missingPackets);
        break;
    case Opcode.Ping:
        writer.uint16(packet.nonce, "be");
        break;
    }

    writer.realloc(writer.cursor);
    return writer;
}
