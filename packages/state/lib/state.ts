import { Hostable, HostableEvents, HostableOptions } from "@skeldjs/core";
import { HazelReader } from "@skeldjs/util";

import {
    HostGameMessage,
    JoinGameMessage,
    RemovePlayerMessage,
    StartGameMessage,
    GameDataToMessage,
    JoinedGameMessage,
    MessageDirection,
    GameSettings,
    EndGameMessage,
} from "@skeldjs/protocol";

export type SkeldjsStateManagerEvents = HostableEvents;

export class SkeldjsStateManager<
    T extends SkeldjsStateManagerEvents = SkeldjsStateManagerEvents
> extends Hostable<T> {
    clientid: number;

    constructor(options: HostableOptions = {}) {
        super({ doFixedUpdate: false, ...options });

        this.clientid = 0;

        this.decoder.on(HostGameMessage, (message, direction) => {
            if (direction === MessageDirection.Clientbound) {
                this.setCode(message.code);
            }
        });

        this.decoder.on(JoinGameMessage, async (message, direction) => {
            if (
                direction === MessageDirection.Clientbound &&
                message.code === this.code
            ) {
                await this.handleJoin(message.clientid);
                await this.setHost(message.hostid);
            }
        });

        this.decoder.on(StartGameMessage, async (message, direction) => {
            if (
                direction === MessageDirection.Clientbound &&
                message.code === this.code
            ) {
                await this.handleStart();
            }
        });

        this.decoder.on(EndGameMessage, async (message, direction) => {
            if (
                direction === MessageDirection.Clientbound &&
                message.code === this.code
            ) {
                await this.handleEnd(message.reason);
            }
        });

        this.decoder.on(RemovePlayerMessage, async (message, direction) => {
            if (
                direction === MessageDirection.Clientbound &&
                message.code === this.code
            ) {
                await this.handleLeave(message.clientid);
                await this.setHost(message.hostid);
            }
        });

        this.decoder.on(
            GameDataToMessage,
            async (message, direction, sender) => {
                if (
                    direction === MessageDirection.Clientbound &&
                    message.code === this.code
                ) {
                    for (const child of message._children) {
                        this.decoder.emitDecoded(child, direction, sender);
                    }
                }
            }
        );

        this.decoder.on(JoinedGameMessage, async (message, direction) => {
            if (direction === MessageDirection.Clientbound) {
                this.clientid = message.clientid;
                await this.setCode(message.code);
                await this.setHost(message.hostid);
                await this.handleJoin(message.clientid);
                for (let i = 0; i < message.others.length; i++) {
                    await this.handleJoin(message.others[i]);
                }
            }
        });
    }

    async handleInboundMessage(message: Buffer) {
        const reader = HazelReader.from(message);
        this.decoder.write(reader, MessageDirection.Clientbound, null);
    }

    async handleOutboundMessage(message: Buffer) {
        const reader = HazelReader.from(message);
        this.decoder.write(reader, MessageDirection.Serverbound, null);
    }

    protected _reset() {
        this.players.clear();
        this.netobjects.clear();
        this.stream = [];
        this.code = 0;
        this.hostid = 0;
        this.settings = new GameSettings;
        this.counter = -1;
        this.privacy = "private";
    }
}
