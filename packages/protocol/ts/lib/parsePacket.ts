import {
    Opcode,
    PayloadTag,
    MessageTag,
    RpcTag,
    DisconnectReason
} from "@skeldjs/constant"

import {
    VoteState,
    PlayerDataFlags,
    PlayerGameData,
    TaskState
} from "@skeldjs/types"

import {
    HazelBuffer,
    readVector2
} from "@skeldjs/util"

import { GameOptions } from "./misc";

import {
    ClientboundPacket,
    ComponentData,
    GameDataMessage,
    GetGameListV2GameListing,
    MasterServer,
    Packet,
    PayloadMessage,
    ServerboundPacket
} from "./packets";

export function parseOptions(reader: HazelBuffer) {
    const options: Partial<GameOptions> = {};
    options.version = reader.uint8() as 1|2|3|4;
    options.players = reader.uint8();
    options.language = reader.int32();
    options.map = reader.uint8();
    options.playerSpeed = reader.float();
    options.crewmateVision = reader.float();
    options.impostorVision = reader.float();
    options.killCooldown = reader.float();
    options.commonTasks = reader.uint8();
    options.longTasks = reader.uint8();
    options.shortTasks = reader.uint8();
    options.emergencies = reader.uint32();
    options.impostors = reader.uint8();
    options.killDistance = reader.uint8();
    options.discussionTime = reader.uint32();
    options.votingTime = reader.uint32();
    options.isDefaults = reader.bool();

    if (options.version !== 1) {
        options.emergencyCooldown = reader.uint8();

        if (options.version !== 2) {
            options.confirmEjects = reader.bool();
            options.visualTasks = reader.bool();

            if (options.version !== 3) {
                options.anonymousVotes = reader.bool();
                options.taskbarUpdates = reader.uint8();
            }
        }
    }

    return options as GameOptions;
}

export function parsePacket(buffer: Buffer|HazelBuffer, bound?: "client"): ClientboundPacket;
export function parsePacket(buffer: Buffer|HazelBuffer, bound?: "server"): ServerboundPacket;
export function parsePacket(buffer: Buffer|HazelBuffer, bound: "client"|"server" = "server"): Packet {
    const packet: Partial<Packet> = {};
    packet.bound = bound;

    if (!Buffer.isBuffer(buffer)) {
        if (bound === "client") return parsePacket(buffer.buffer, "client"); // Weird TypeScript typings, need something better xx.
        if (bound === "server") return parsePacket(buffer.buffer, "server");
        return;
    }

    const reader = new HazelBuffer(buffer);

    packet.op = reader.uint8();

    switch (packet.op) {
    case Opcode.Reliable:
        packet.nonce = reader.uint16("be");
    case Opcode.Unreliable:
        packet.payloads = [];
        while (reader.left > 0) {
            const payload: Partial<PayloadMessage> = {};

            const [ ptag, preader ] = reader.message();
            payload.tag = ptag;
            payload.bound = packet.bound;

            switch (payload.tag) {
            case PayloadTag.HostGame:
                if (payload.bound === "client") {
                    payload.code = preader.int32();
                } else {
                    payload.settings = parseOptions(preader);
                }
                break;
            case PayloadTag.JoinGame:
                if (payload.bound === "client") {
                    payload.error = preader.left === 4;
                    if (payload.error) {
                        payload.reason = preader.uint32();
                    } else if (payload.error === false) {
                        payload.code = preader.int32();
                        payload.clientid = preader.uint32();
                        payload.hostid = preader.uint32();
                    }
                } else {
                    payload.code = preader.int32();
                    payload.mapOwnership = preader.byte();
                }
                break;
            case PayloadTag.StartGame:
                payload.code = preader.int32();
                break;
            case PayloadTag.RemoveGame:
                payload.reason = preader.uint8();
                break;
            case PayloadTag.RemovePlayer:
                payload.code = preader.int32();

                if (payload.bound === "client") {
                    payload.clientid = preader.uint32();
                    payload.hostid = preader.uint32();
                } else {
                    payload.clientid = preader.upacked();
                }
                break;
            case PayloadTag.GameData:
            case PayloadTag.GameDataTo:
                payload.code = preader.int32();

                if (payload.tag === PayloadTag.GameDataTo) {
                    payload.recipientid = preader.upacked();
                }

                payload.messages = [];
                while (preader.left) {
                    const message: Partial<GameDataMessage> = {};

                    const [ mtag, mreader ] = preader.message();
                    message.tag = mtag;

                    switch (message.tag) {
                    case MessageTag.Data:
                        message.netid = mreader.upacked();
                        const data_sz = mreader.left;
                        message.data = mreader.buf(data_sz);
                        break;
                    case MessageTag.RPC:
                        message.netid = mreader.upacked();
                        message.rpcid = mreader.uint8();

                        switch (message.rpcid) {
                        case RpcTag.PlayAnimation:
                            message.task = mreader.uint8();
                            break;
                        case RpcTag.CompleteTask:
                            message.taskIdx = mreader.upacked();
                            break;
                        case RpcTag.SyncSettings:
                            message.settings = parseOptions(mreader);
                            break;
                        case RpcTag.SetInfected:
                            const num_infected = mreader.upacked();
                            message.impostors = [];
                            for (let i = 0; i < num_infected; i++) {
                                message.impostors.push(mreader.uint8());
                            }
                            break;
                        case RpcTag.Exiled:
                            break;
                        case RpcTag.CheckName:
                            message.name = mreader.string();
                            break;
                        case RpcTag.SetName:
                            message.name = mreader.string();
                            break;
                        case RpcTag.CheckColor:
                            message.color = mreader.uint8();
                            break;
                        case RpcTag.SetColor:
                            message.color = mreader.uint8();
                            break;
                        case RpcTag.SetHat:
                            message.hat = mreader.upacked();
                            break;
                        case RpcTag.SetSkin:
                            message.skin = mreader.upacked();
                            break;
                        case RpcTag.ReportDeadBody:
                            message.bodyid = mreader.uint8();
                            break;
                        case RpcTag.MurderPlayer:
                            message.victimid = mreader.uint8();
                            break;
                        case RpcTag.SendChat:
                            message.message = mreader.string();
                            break;
                        case RpcTag.StartMeeting:
                            message.bodyid = mreader.uint8();
                            break;
                        case RpcTag.SetScanner:
                            message.scanning = mreader.bool();
                            message.count = mreader.uint8();
                            break;
                        case RpcTag.SendChatNote:
                            message.playerid = mreader.uint8();
                            message.type = mreader.uint8();
                            break;
                        case RpcTag.SetPet:
                            message.pet = mreader.upacked();
                            break;
                        case RpcTag.SetStartCounter:
                            message.seqId = mreader.upacked();
                            message.time = mreader.int8();
                            break;
                        case RpcTag.EnterVent:
                            message.ventid = mreader.upacked();
                            break;
                        case RpcTag.ExitVent:
                            message.ventid = mreader.upacked();
                            break;
                        case RpcTag.SnapTo:
                            message.position = readVector2(mreader);
                            message.seqId = mreader.uint16();
                            break;
                        case RpcTag.Close:
                            break;
                        case RpcTag.VotingComplete:
                            const num_states = mreader.upacked();
                            message.states = [];
                            for (let i = 0; i < num_states; i++) {
                                message.states.push({
                                    state: mreader.byte(),
                                    get voted() {
                                        return (this.state & VoteState.VotedFor) - 1
                                    }
                                });
                            }
                            message.exiled = mreader.uint8();
                            message.tie = mreader.bool();
                            break;
                        case RpcTag.CastVote:
                            message.votingid = mreader.uint8();
                            message.suspectid = mreader.uint8();
                            break;
                        case RpcTag.ClearVote:
                            break;
                        case RpcTag.AddVote:
                            message.votingid = mreader.uint32();
                            message.targetid = mreader.uint32();
                            break;
                        case RpcTag.CloseDoorsOfType:
                            message.systemid = mreader.uint8();
                            break;
                        case RpcTag.RepairSystem:
                            message.systemid = mreader.uint8();
                            message.repairerid = mreader.upacked();
                            message.value = mreader.uint8();
                            break;
                        case RpcTag.SetTasks:
                            message.playerid = mreader.uint8();
                            const num_tasks = mreader.upacked();
                            message.taskids = [];
                            for (let i = 0; i < num_tasks; i++) {
                                message.taskids.push(mreader.upacked());
                            }
                            break;
                        case RpcTag.UpdateGameData:
                            message.players = [];

                            while (mreader.left > 0) {
                                const player: Partial<PlayerGameData> = {};
                                const [ playerId, preader ] = mreader.message();

                                player.playerId = playerId;
                                player.name = preader.string();
                                player.color = preader.uint8();
                                player.hat = preader.upacked();
                                player.pet = preader.upacked();
                                player.skin = preader.upacked();
                                const flags = preader.byte();
                                player.disconnected = (flags & PlayerDataFlags.Disconnected) > 0;
                                player.impostor = (flags & PlayerDataFlags.Impostor) > 0;
                                player.dead = (flags & PlayerDataFlags.Dead) > 0;
                                const num_tasks = preader.uint8();
                                player.tasks = [];
                                for (let i = 0; i < num_tasks; i++) {
                                    const task: Partial<TaskState> = {};

                                    task.taskIdx = preader.upacked();
                                    task.completed = preader.bool();

                                    player.tasks.push(task as TaskState);
                                }

                                message.players.push(player as PlayerGameData);
                            }
                            break;
                        }
                        break;
                    case MessageTag.Spawn:
                        message.type = mreader.upacked();
                        message.ownerid = mreader.packed();
                        message.flags = mreader.byte();

                        const num_components = mreader.upacked();
                        message.components = [];
                        for (let i = 0; i < num_components; i++) {
                            const component: Partial<ComponentData> = {};
                            component.netid = mreader.upacked();
                            component.data = mreader.message()[1];

                            message.components.push(component as ComponentData);
                        }
                        break;
                    case MessageTag.Despawn:
                        message.netid = mreader.upacked();
                        break;
                    case MessageTag.SceneChange:
                        message.clientid = mreader.upacked();
                        message.scene = mreader.string();
                        break;
                    case MessageTag.Ready:
                        message.clientid = mreader.upacked();
                        break;
                    case MessageTag.ChangeSettings:
                        break;
                    }

                    payload.messages.push(message as GameDataMessage);
                }
                break;
            case PayloadTag.JoinedGame:
                payload.code = preader.int32();
                payload.clientid = preader.uint32();
                payload.hostid = preader.uint32();

                const num_clients = preader.upacked();
                payload.clients = [];
                for (let i = 0; i < num_clients; i++) {
                    payload.clients.push(preader.upacked());
                }
                break;
            case PayloadTag.EndGame:
                payload.code = preader.int32();
                payload.reason = preader.uint8();
                payload.show_ad = preader.bool();
                break;
            case PayloadTag.GetGameList:
                break;
            case PayloadTag.AlterGame:
                payload.code = preader.int32();
                payload.alter_tag = preader.uint8();
                payload.value = preader.uint8();
                break;
            case PayloadTag.KickPlayer:
                payload.code = preader.int32();
                payload.clientid = preader.upacked();
                payload.banned = preader.bool();

                if (preader.left > 0) {
                    payload.reason = preader.uint8();
                }
                break;
            case PayloadTag.WaitForHost:
                payload.code = preader.int32();
                payload.clientid = preader.upacked();
                break;
            case PayloadTag.Redirect:
                payload.ip = preader.ip();
                payload.port = preader.uint16();
                break;
            case PayloadTag.MasterServerList:
                preader.jump(1);

                const num_servers = preader.upacked();
                payload.servers = [];
                for (let i = 0; i < num_servers; i++) {
                    const [ , sreader ] = preader.message();

                    const server: Partial<MasterServer> = {};
                    server.name = sreader.string();
                    server.ip = sreader.ip();
                    server.port = sreader.uint16();
                    server.players = sreader.upacked();

                    payload.servers.push(server as MasterServer);
                }
                break;
            case PayloadTag.GetGameListV2:
                if (payload.bound === "server") {
                    preader.upacked();
                    payload.options = parseOptions(preader);
                } else {
                    while (preader.left > 0) {
                        const [ ltag, lreader ] = preader.message();

                        switch (ltag) {
                        case 0:
                            payload.games = [];

                            while (lreader.left > 0) {
                                const game: Partial<GetGameListV2GameListing> = {};
                            
                                const [ , greader ] = lreader.message();
                                game.ip = greader.ip();
                                game.port = greader.uint16();
                                game.code = greader.int32();
                                game.name = greader.string();
                                game.players = greader.uint8();
                                game.age = greader.upacked();
                                game.map = greader.uint8();
                                game.impostors = greader.uint8();
                                game.max_players = greader.uint8();

                                payload.games.push(game as GetGameListV2GameListing);
                            }
                            break;
                        case 1:
                            payload.counts = {
                                theskeld: 0,
                                mirahq: 0,
                                polus: 0
                            };
                            payload.counts.theskeld = lreader.uint32();
                            payload.counts.mirahq = lreader.uint32();
                            payload.counts.polus = lreader.uint32();
                            break;
                        }
                    }
                    break;
                }
            }

            packet.payloads.push(payload as any); // Dumb type errors with the clientbound/serverbound.
        }
        break;
    case Opcode.Hello:
        packet.nonce = reader.uint16("be");
        packet.hazelver = reader.uint8();
        packet.clientver = reader.int32();
        packet.username = reader.string();
        break;
    case Opcode.Disconnect:
        if (reader.left > 0) {
            packet.show_reason = reader.bool();

            if (reader.left > 0) {
                const [ , dreader ] = reader.message();
                packet.reason = dreader.uint8();

                if (packet.reason === DisconnectReason.Custom && dreader.left > 0) {
                    packet.message = dreader.string();
                }
            }
        }
        break;
    case Opcode.Acknowledge:
        packet.nonce = reader.uint16("be");
        packet.missingPackets = reader.byte();
        break;
    case Opcode.Ping:
        packet.nonce = reader.uint16("be");
        break;
    }

    return packet as Packet;
}