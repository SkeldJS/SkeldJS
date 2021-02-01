import { Hostable, Room, RoomID } from "@skeldjs/core";
import { TypedEvents } from "@skeldjs/util";
import { parsePacket, ClientboundPacket, GameDataMessage } from "@skeldjs/protocol";

import {
    AlterGameTag,
    GameEndReason,
    Opcode,
    PayloadTag
} from "@skeldjs/constant";

import { StateManagerOptions } from "./interface/StateManagerOptions";

export type SkeldjsStateManagerEvents = {

}

export class SkeldjsStateManager<T extends TypedEvents> extends Hostable<T & SkeldjsStateManagerEvents> {
    room: Room;

    constructor(public options: StateManagerOptions = { allowHost: true }) {
        super();

        setInterval(this.FixedUpdate.bind(this), SkeldjsStateManager.FixedUpdateInterval);
    }

    protected async FixedUpdate() {
        this.stream.splice(0);
    }

    handleJoinGame(clientid: number, hostid: number) {
        this.room.handleJoin(clientid);
        this.room.setHost(hostid);
    }

    handleStart() {
        this.room.handleStart();
    }

    handleEnd(reason: GameEndReason) {
        this.room.handleEnd(reason);
    }

    handleRemovePlayer(clientid: number, hostid: number) {
        this.room.handleLeave(clientid);
        this.room.setHost(hostid);
    }

    async handleGameData(messages: GameDataMessage[]) {
        await Promise.all(messages.map(message => {
            return this.room.handleGameData(message);
        }));
    }

    handleJoinedGame(code: RoomID, clientid: number, hostid: number, clientids: number[]) {
        this.clientid = clientid;

        this.room = new Room(this, code);
        this.room.setHost(hostid);

        this.room.handleJoin(this.clientid);
        for (let i = 0; i < clientids.length; i++) {
            this.room.handleJoin(clientids[i]);
        }
    }

    handleAlterGame(tag: AlterGameTag, value: number) {
        this.room.setAlterGameTag(tag, value);
    }

    async handlePacket(packet: ClientboundPacket) {
        switch (packet.op) {
        case Opcode.Unreliable:
        case Opcode.Reliable:
            for (let i = 0; i < packet.payloads.length; i++) {
                const payload = packet.payloads[i];

                switch (payload.tag) {
                case PayloadTag.HostGame:
                    if (this.room) {
                        this.room.setCode(payload.code);
                    }
                    break;
                case PayloadTag.JoinGame:
                    if (payload.error === false) { // For typings
                        if (this.room && this.room.code === payload.code) {
                            this.handleJoinGame(payload.clientid, payload.hostid);
                        }
                    }
                    break;
                case PayloadTag.StartGame:
                    if (this.room && this.room.code === payload.code) {
                        await this.handleStart();
                    }
                    break;
                case PayloadTag.EndGame:
                    if (this.room && this.room.code === payload.code) {
                        await this.handleEnd(payload.reason);
                    }
                    break;
                case PayloadTag.RemovePlayer:
                    if (this.room && this.room.code === payload.code) {
                        this.handleRemovePlayer(payload.clientid, payload.hostid);
                    }
                    break;
                case PayloadTag.GameData:
                case PayloadTag.GameDataTo:
                    if (this.room && this.room.code === payload.code) {
                        this.handleGameData(payload.messages);
                    }
                    break;
                case PayloadTag.JoinedGame:
                    this.handleJoinedGame(payload.code, payload.clientid, payload.hostid, payload.clients);
                    break;
                case PayloadTag.AlterGame:
                    this.handleAlterGame(payload.alter_tag, payload.value);
                    break;
                }
            }
            break;
        }
    }

    async onMessage(message: Buffer) {
        const packet = parsePacket(message, "client");
        this.handlePacket(packet);
    }

    static FixedUpdateInterval = 1000 / 50;
}
