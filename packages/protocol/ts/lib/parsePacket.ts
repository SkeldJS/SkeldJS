import {
    Opcode,
    PayloadTag,
    MessageTag,
    RpcTag,
    DisconnectReason,
} from "@skeldjs/constant";

import { HazelBuffer, readVector2 } from "@skeldjs/util";

import { GameOptions } from "./misc";

import {
    ClientboundPacket,
    ComponentData,
    GameDataMessage,
    GetGameListV2GameListing,
    MasterServer,
    Packet,
    PayloadMessage,
    ServerboundPacket,
} from "./packets";

export function parseOptions(reader: HazelBuffer) {
    const options: Partial<GameOptions> = {};
    reader.packed(); // Skip options length
    options.version = reader.uint8() as 1 | 2 | 3 | 4;
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

export function parseGameData(
    tag: number,
    reader: HazelBuffer
): GameDataMessage {
    const message: Partial<GameDataMessage> = {};
    message.tag = tag;

    switch (message.tag) {
        case MessageTag.Data:
            message.netid = reader.upacked();
            const data_sz = reader.left;
            message.data = reader.buf(data_sz);
            break;
        case MessageTag.RPC:
            message.netid = reader.upacked();
            message.rpcid = reader.uint8();

            switch (message.rpcid) {
                case RpcTag.PlayAnimation:
                    message.task = reader.uint8();
                    break;
                case RpcTag.CompleteTask:
                    message.taskIdx = reader.upacked();
                    break;
                case RpcTag.SyncSettings:
                    message.settings = parseOptions(reader);
                    break;
                case RpcTag.SetInfected:
                    const num_infected = reader.upacked();
                    message.impostors = [];
                    for (let i = 0; i < num_infected; i++) {
                        message.impostors.push(reader.uint8());
                    }
                    break;
                case RpcTag.Exiled:
                    break;
                case RpcTag.CheckName:
                    message.name = reader.string();
                    break;
                case RpcTag.SetName:
                    message.name = reader.string();
                    break;
                case RpcTag.CheckColor:
                    message.color = reader.uint8();
                    break;
                case RpcTag.SetColor:
                    message.color = reader.uint8();
                    break;
                case RpcTag.SetHat:
                    message.hat = reader.upacked();
                    break;
                case RpcTag.SetSkin:
                    message.skin = reader.upacked();
                    break;
                case RpcTag.ReportDeadBody:
                    message.bodyid = reader.uint8();
                    break;
                case RpcTag.MurderPlayer:
                    message.victimid = reader.upacked();
                    break;
                case RpcTag.SendChat:
                    message.message = reader.string();
                    break;
                case RpcTag.StartMeeting:
                    message.bodyid = reader.uint8();
                    break;
                case RpcTag.SetScanner:
                    message.scanning = reader.bool();
                    message.count = reader.uint8();
                    break;
                case RpcTag.SendChatNote:
                    message.playerid = reader.uint8();
                    message.type = reader.uint8();
                    break;
                case RpcTag.SetPet:
                    message.pet = reader.upacked();
                    break;
                case RpcTag.SetStartCounter:
                    message.seqId = reader.upacked();
                    message.time = reader.int8();
                    break;
                case RpcTag.EnterVent:
                    message.ventid = reader.upacked();
                    break;
                case RpcTag.ExitVent:
                    message.ventid = reader.upacked();
                    break;
                case RpcTag.SnapTo:
                    message.position = readVector2(reader);
                    message.seqId = reader.uint16();
                    break;
                case RpcTag.Close:
                    break;
                case RpcTag.VotingComplete:
                    const num_states = reader.upacked();
                    message.states = [];
                    for (let i = 0; i < num_states; i++) {
                        message.states.push(reader.byte());
                    }
                    message.exiled = reader.uint8();
                    message.tie = reader.bool();
                    break;
                case RpcTag.CastVote:
                    message.votingid = reader.uint8();
                    message.suspectid = reader.uint8();
                    break;
                case RpcTag.ClearVote:
                    break;
                case RpcTag.AddVote:
                    message.votingid = reader.uint32();
                    message.targetid = reader.uint32();
                    break;
                case RpcTag.CloseDoorsOfType:
                    message.systemid = reader.uint8();
                    break;
                case RpcTag.RepairSystem:
                    message.systemid = reader.uint8();
                    message.repairerid = reader.upacked();
                    message.value = reader.uint8();
                    break;
                case RpcTag.SetTasks:
                    message.playerid = reader.uint8();
                    const num_tasks = reader.upacked();
                    message.taskids = [];
                    for (let i = 0; i < num_tasks; i++) {
                        message.taskids.push(reader.upacked());
                    }
                    break;
            }
            break;
        case MessageTag.Spawn:
            message.type = reader.upacked();
            message.ownerid = reader.packed();
            message.flags = reader.byte();

            const num_components = reader.upacked();
            message.components = [];
            for (let i = 0; i < num_components; i++) {
                const component: Partial<ComponentData> = {};
                component.netid = reader.upacked();
                component.data = reader.message()[1];

                message.components.push(component as ComponentData);
            }
            break;
        case MessageTag.Despawn:
            message.netid = reader.upacked();
            break;
        case MessageTag.SceneChange:
            message.clientid = reader.upacked();
            message.scene = reader.string();
            break;
        case MessageTag.Ready:
            message.clientid = reader.upacked();
            break;
        case MessageTag.ChangeSettings:
            break;
    }

    return message as GameDataMessage;
}

export function parsePayload(bound: "client"|"server", tag: number, reader: HazelBuffer): PayloadMessage {
    const payload: Partial<PayloadMessage> = {};
    payload.tag = tag;
    payload.bound = bound;

    switch (payload.tag) {
        case PayloadTag.HostGame:
            if (payload.bound === "client") {
                payload.code = reader.int32();
            } else {
                payload.settings = parseOptions(reader);
            }
            break;
        case PayloadTag.JoinGame:
            if (payload.bound === "client") {
                payload.error = !!DisconnectReason[
                    reader.buffer.readInt32LE(reader.cursor)
                ];
                console.log(reader.buffer.readInt32LE(reader.cursor));
                if (payload.error) {
                    payload.reason = reader.uint32();
                } else if (payload.error === false) {
                    payload.code = reader.int32();
                    payload.clientid = reader.uint32();
                    payload.hostid = reader.uint32();
                }
            } else {
                payload.code = reader.int32();
            }
            break;
        case PayloadTag.StartGame:
            payload.code = reader.int32();
            break;
        case PayloadTag.RemoveGame:
            payload.reason = reader.uint8();
            break;
        case PayloadTag.RemovePlayer:
            payload.code = reader.int32();

            if (payload.bound === "client") {
                payload.clientid = reader.uint32();
                payload.hostid = reader.uint32();
            } else {
                payload.clientid = reader.upacked();
            }
            break;
        case PayloadTag.GameData:
        case PayloadTag.GameDataTo:
            payload.code = reader.int32();

            if (payload.tag === PayloadTag.GameDataTo) {
                payload.recipientid = reader.upacked();
            }

            payload.messages = [];
            while (reader.left) {
                const [mtag, mreader] = reader.message();
                payload.messages.push(parseGameData(mtag, mreader));
            }
            break;
        case PayloadTag.JoinedGame:
            payload.code = reader.int32();
            payload.clientid = reader.uint32();
            payload.hostid = reader.uint32();

            const num_clients = reader.upacked();
            payload.clients = [];
            for (let i = 0; i < num_clients; i++) {
                payload.clients.push(reader.upacked());
            }
            break;
        case PayloadTag.EndGame:
            payload.code = reader.int32();
            payload.reason = reader.uint8();
            payload.show_ad = reader.bool();
            break;
        case PayloadTag.GetGameList:
            break;
        case PayloadTag.AlterGame:
            payload.code = reader.int32();
            payload.alter_tag = reader.uint8();
            payload.value = reader.uint8();
            break;
        case PayloadTag.KickPlayer:
            payload.code = reader.int32();
            payload.clientid = reader.upacked();
            payload.banned = reader.bool();

            if (reader.left > 0) {
                payload.reason = reader.uint8();
            }
            break;
        case PayloadTag.WaitForHost:
            payload.code = reader.int32();
            payload.clientid = reader.upacked();
            break;
        case PayloadTag.Redirect:
            payload.ip = reader.ip();
            payload.port = reader.uint16();
            break;
        case PayloadTag.MasterServerList:
            reader.jump(1);

            const num_servers = reader.upacked();
            payload.servers = [];
            for (let i = 0; i < num_servers; i++) {
                const [, sreader] = reader.message();

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
                reader.upacked();
                payload.options = parseOptions(reader);
            } else {
                while (reader.left > 0) {
                    const [ltag, lreader] = reader.message();

                    switch (ltag) {
                        case 0:
                            payload.games = [];

                            while (lreader.left > 0) {
                                const game: Partial<GetGameListV2GameListing> = {};

                                const [, greader] = lreader.message();
                                game.ip = greader.ip();
                                game.port = greader.uint16();
                                game.code = greader.int32();
                                game.name = greader.string();
                                game.players = greader.uint8();
                                game.age = greader.upacked();
                                game.map = greader.uint8();
                                game.impostors = greader.uint8();
                                game.max_players = greader.uint8();

                                payload.games.push(
                                    game as GetGameListV2GameListing
                                );
                            }
                            break;
                        case 1:
                            payload.counts = {
                                theskeld: 0,
                                mirahq: 0,
                                polus: 0,
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
    return payload as PayloadMessage;
}

export function parsePacket(
    buffer: Buffer | HazelBuffer,
    bound?: "client"
): ClientboundPacket;
export function parsePacket(
    buffer: Buffer | HazelBuffer,
    bound?: "server"
): ServerboundPacket;
export function parsePacket(
    buffer: Buffer | HazelBuffer,
    bound: "client" | "server" = "server"
): Packet {
    const packet: Partial<Packet> = {};
    packet.bound = bound;

    if (!Buffer.isBuffer(buffer)) {
        if (bound === "client") return parsePacket(buffer.buffer, "client"); // Weird TypeScript typings.
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
                const [ ptag, preader ] = reader.message();
                packet.payloads.push(parsePayload(packet.bound, ptag, preader) as any); // Dumb type errors with the clientbound/serverbound.
            }
            break;
        case Opcode.Hello:
            packet.nonce = reader.uint16("be");
            packet.hazelver = reader.uint8();
            packet.clientver = reader.int32();
            packet.username = reader.string();
            packet.token = reader.uint32();
            break;
        case Opcode.Disconnect:
            if (reader.left > 0) {
                packet.show_reason = reader.bool();

                if (reader.left > 0) {
                    const [, dreader] = reader.message();
                    packet.reason = dreader.uint8();

                    if (
                        packet.reason === DisconnectReason.Custom &&
                        dreader.left > 0
                    ) {
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
