import {
    Hostable,
    HostableEvents,
    HostableOptions,
    Opcode,
    PayloadTag
} from "@skeldjs/core";

import {
    PayloadMessageClientbound,
    ClientboundPacket,
    parsePacket,
    ServerboundPacket,
    PayloadMessageServerbound
} from "@skeldjs/protocol";

export interface SkeldjsStateManagerEvents extends HostableEvents {
    /**
     * Emitted before a packet is processed.
     */
    "packet": {
        /**
         * The packet that is going to be processed.
         */
        packet: ClientboundPacket;
    };

    /**
     * Emitted before a payload is processed.
     */
    "payload": {
        /**
         * The payload that is going to be processed.
         */
        payload: PayloadMessageClientbound;
    }
}

export class SkeldjsStateManager<T extends Record<string, any> = {}> extends Hostable<T> {
    clientid: number;

    constructor(options: HostableOptions = {}) {
        super({ doFixedUpdate: false, ...options });
    }

    get me() {
        return null;
    }

    get amhost() {
        return false;
    }

    async handleInboundPayload(payload: PayloadMessageClientbound) {
        if (await this.emit("payload", { payload })) {
            switch (payload.tag) {
                case PayloadTag.HostGame:
                    console.log(payload.code);
                    this.setCode(payload.code);
                    break;
                case PayloadTag.JoinGame:
                    if (payload.error === false) {
                        if (this.code === payload.code) {
                            await this.handleJoin(payload.clientid);
                            await this.setHost(payload.hostid);
                        }
                    }
                    break;
                case PayloadTag.StartGame:
                    if (this.code === payload.code) {
                        await this.handleStart();
                    }
                    break;
                case PayloadTag.EndGame:
                    if (this.code === payload.code) {
                        await this.handleEnd(payload.reason);
                    }
                    break;
                case PayloadTag.RemovePlayer:
                    if (this.code === payload.code) {
                        await this.handleLeave(payload.clientid);
                        await this.setHost(payload.hostid);
                    }
                    break;
                case PayloadTag.GameData:
                case PayloadTag.GameDataTo:
                    if (this.code === payload.code) {
                        for (
                            let i = 0;
                            i < payload.messages.length;
                            i++
                        ) {
                            const message = payload.messages[i];

                            await this.handleGameData(message);
                        }
                    }
                    break;
                case PayloadTag.JoinedGame:
                    this.clientid = payload.clientid;
                    await this.setCode(payload.code);
                    await this.setHost(payload.hostid);
                    await this.handleJoin(payload.clientid);
                    for (let i = 0; i < payload.clients.length; i++) {
                        await this.handleJoin(payload.clients[i]);
                    }
                    break;
                case PayloadTag.AlterGame:
                    this._setAlterGameTag(
                        payload.alter_tag,
                        payload.value
                    );
                    break;
            }
        }
    }

    async handleInboundPacket(packet: ClientboundPacket) {
        if (await this.emit("packet", { packet })) {
            if (
                packet.op === Opcode.Unreliable ||
                packet.op === Opcode.Reliable
            ) {
                for (let i = 0; i < packet.payloads.length; i++) {
                    const payload = packet.payloads[i];
                    await this.handleInboundPayload(payload);
                }
            }
        }
    }

    async handleInboundMessage(message: Buffer) {
        const packet = parsePacket(message, "client");
        await this.handleInboundPacket(packet);
    }

    async handleOutboundPayload(payload: PayloadMessageServerbound) {
        if (await this.emit("payload", { payload })) {
            switch (payload.tag) {
                case PayloadTag.GameData:
                case PayloadTag.GameDataTo:
                    if (this.code === payload.code) {
                        for (
                            let i = 0;
                            i < payload.messages.length;
                            i++
                        ) {
                            const message = payload.messages[i];

                            await this.handleGameData(message);
                        }
                    }
                    break;
                case PayloadTag.AlterGame:
                    this._setAlterGameTag(
                        payload.alter_tag,
                        payload.value
                    );
                    break;
            }
        }
    }

    async handleOutboundPacket(packet: ServerboundPacket) {
        if (await this.emit("packet", { packet })) {
            if (
                packet.op === Opcode.Unreliable ||
                packet.op === Opcode.Reliable
            ) {
                for (let i = 0; i < packet.payloads.length; i++) {
                    const payload = packet.payloads[i];
                    await this.handleOutboundPayload(payload);
                }
            }
        }
    }

    async handleOutboundMessage(message: Buffer) {
        const packet = parsePacket(message, "server");
        await this.handleOutboundPacket(packet);
    }

    protected _reset() {
        this.objects.clear();
        this.players.clear();
        this.netobjects.clear();
        this.stream = [];
        this.code = 0;
        this.hostid = 0;
        this.settings = null;
        this.counter = -1;
        this.privacy = "private";
    }
}
