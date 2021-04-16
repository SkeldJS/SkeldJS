import {
    Hostable,
    HostableEvents,
    Opcode,
    PayloadTag,
    PlayerData,
    PlayerDataResolvable,
} from "@skeldjs/core";

import {
    GameDataMessage,
    GameDataPayload,
    GameDataToPayload,
    PayloadMessageClientbound,
} from "@skeldjs/protocol";

import { EventEmitter } from "@skeldjs/events";

import { SpecialID } from "./constants/IDs";
import { RoomConfig } from "./interface/RoomConfig";
import { RemoteClient } from "./RemoteClient";
import { SkeldjsServer } from "./server";

export interface RoomEvents extends HostableEvents {
    /**
     * Emitted when the room is destroyed.
     */
    "room.destroy": {};
}

/**
 * Represents a room on the server.
 *
 * See {@link RoomEvents} for events to listen to.
 */
export class Room extends Hostable<RoomEvents> {
    /**
     * The remote clients currently connected to the room.
     */
    remotes: Map<number, RemoteClient>;

    constructor(private server: SkeldjsServer, public options: RoomConfig) {
        super({ doFixedUpdate: true });

        this.remotes = new Map();

        this.on("game.start", () => {
            if (this.amhost) {
                this.setHost(SpecialID.SaaH);
            }
        });
    }

    async emit(...args: any[]): Promise<boolean> {
        const event = args[0];
        const data = args[1];

        this.server.emit(event, {
            ...data,
            room: this,
        });

        return EventEmitter.prototype.emit.call(this, event, data);
    }

    get me() {
        return null;
    }

    get amhost() {
        return this.hostid === SpecialID.SaaH;
    }

    async handleStart() {
        await this.setHost(SpecialID.SaaH);
        return await super.handleStart();
    }

    async destroy() {
        await this.broadcast(null, true, null, [
            {
                tag: PayloadTag.RemoveGame,
            },
        ]);
        this.remotes.clear();
        this.players.clear();
        this.objects.clear();
        this.netobjects.clear();
        this.server.rooms.delete(this.code);
    }

    async handleLeave(resolvable: PlayerDataResolvable) {
        const player = await super.handleLeave(resolvable);

        if (!this.players.size) {
            this.destroy();
            return player;
        }

        if (player) {
            if (player.ishost) {
                this.setHost([...this.players.values()][0]);
            }
            this.remotes.delete(player.id);
        }

        return player;
    }

    async setHost(host: PlayerDataResolvable) {
        super.setHost(host);

        for (const [, remote] of this.remotes) {
            await remote.sendPayload(
                true,
                {
                    tag: PayloadTag.JoinGame,
                    error: false,
                    code: this.code,
                    clientid: SpecialID.Nil,
                    hostid: SpecialID.SaaH
                        ? this.started
                            ? SpecialID.SaaH
                            : remote.clientid
                        : this.hostid,
                },
                {
                    tag: PayloadTag.RemovePlayer,
                    code: this.code,
                    clientid: SpecialID.Nil,
                    hostid: SpecialID.SaaH
                        ? this.started
                            ? SpecialID.SaaH
                            : remote.clientid
                        : this.hostid,
                    reason: 0,
                }
            );
        }
    }

    async broadcast(
        messages: GameDataMessage[],
        reliable = true,
        recipient: PlayerData = null,
        payloads: PayloadMessageClientbound[] = []
    ) {
        if (recipient) {
            const remote = this.remotes.get(recipient.id);
            if (remote) {
                await remote.send({
                    op: reliable ? Opcode.Reliable : Opcode.Unreliable,
                    payloads: [
                        ...(messages?.length
                            ? [
                                  {
                                      tag: PayloadTag.GameDataTo,
                                      code: this.code,
                                      recipientid: recipient.id,
                                      messages,
                                  } as GameDataToPayload,
                              ]
                            : []),
                        ...payloads,
                    ],
                });
            }
        } else {
            for (const [, remote] of this.remotes) {
                await remote.send({
                    op: reliable ? Opcode.Reliable : Opcode.Unreliable,
                    payloads: [
                        ...(messages?.length
                            ? [
                                  {
                                      tag: PayloadTag.GameData,
                                      code: this.code,
                                      messages,
                                  } as GameDataPayload,
                              ]
                            : []),
                        ...payloads,
                    ],
                });
            }
        }
    }
}
