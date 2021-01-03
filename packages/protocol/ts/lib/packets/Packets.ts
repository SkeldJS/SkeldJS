import {
    DisconnectReason,
    Opcode
} from "@skeldjs/constant"

import {
    PayloadMessage,
    PayloadMessageClientbound,
    PayloadMessageServerbound
} from "./Payloads"

export interface BasePacket {
    op: Opcode;
    bound?: "server"|"client";
}

export interface BaseHazelMessage {
    tag: number;
}

export interface BaseNormalPacket extends BasePacket {
    op: Opcode.Unreliable|Opcode.Reliable,
    payloads: PayloadMessage[];
}

export interface UnreliablePacketClientbound extends BaseNormalPacket {
    op: Opcode.Unreliable;
    bound?: "client";
    payloads: PayloadMessageClientbound[];
}

export interface UnreliablePacketServerbound extends BaseNormalPacket {
    op: Opcode.Unreliable;
    bound?: "server";
    payloads: PayloadMessageServerbound[];
}
export type UnreliablePacket = UnreliablePacketClientbound|UnreliablePacketServerbound;

export interface ReliablePacketClientbound extends BasePacket {
    op: Opcode.Reliable;
    bound?: "client";
    nonce?: number;
    payloads: PayloadMessageClientbound[];
}

export interface ReliablePacketServerbound extends BasePacket {
    op: Opcode.Reliable;
    bound?: "server";
    nonce?: number;
    payloads: PayloadMessageServerbound[];
}

export type ReliablePacket = ReliablePacketClientbound|ReliablePacketServerbound;

export interface HelloPacket extends BasePacket {
    op: Opcode.Hello;
    nonce?: number;
    hazelver: number;
    clientver: number;
    username: string;
}

export interface DisconnectPacket extends BasePacket {
    op: Opcode.Disconnect,
    show_reason?: boolean;
    reason?: DisconnectReason,
    message?: string;
}

export interface AcknowledgementPacket extends BasePacket {
    op: Opcode.Acknowledge;
    nonce?: number;
    missingPackets: number;
}

export interface PingPacket extends BasePacket {
    op: Opcode.Ping;
    nonce?: number;
}

export type NormalPacket = UnreliablePacket|ReliablePacket;

export type NormalClientbound = UnreliablePacketClientbound|ReliablePacketClientbound;
export type NormalServerbound = UnreliablePacketServerbound|ReliablePacketServerbound;

export type SpecialPacket = HelloPacket|DisconnectPacket|AcknowledgementPacket|PingPacket;

export type ClientboundPacket = NormalClientbound|SpecialPacket;
export type ServerboundPacket = NormalServerbound|SpecialPacket;

export type Packet = NormalPacket|SpecialPacket;