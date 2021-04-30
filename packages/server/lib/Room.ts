import {
    DisconnectReason,
    Hostable,
    HostableEvents,
    PlayerData,
    PlayerDataResolvable,
} from "@skeldjs/core";

import {
    BaseGameDataMessage,
    BaseRootMessage,
    GameDataMessage,
    GameDataToMessage,
    JoinGameMessage,
    ReliablePacket,
    RemoveGameMessage,
    RemovePlayerMessage,
    UnreliablePacket,
} from "@skeldjs/protocol";

import { ExtractEventTypes } from "@skeldjs/events";

import { SpecialID } from "./constants/IDs";
import { RoomConfig } from "./interface/RoomConfig";
import { RemoteClient } from "./RemoteClient";
import { SkeldjsServer } from "./server";
import { RoomDestroyEvent } from "./events";

export type RoomEvents =
    HostableEvents &
ExtractEventTypes<[
    RoomDestroyEvent
]>;

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

        this.on("room.game.start", () => {
            if (this.amhost) {
                this.setHost(SpecialID.SaaH);
            }
        });
    }

    async emit<Event extends RoomEvents[keyof RoomEvents]>(
        event: Event
    ): Promise<Event> {
        this.server.emit(event);

        return super.emit(event);
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
        await this.broadcast(null, true, null, [new RemoveGameMessage()]);
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
            await remote.send(
                new ReliablePacket(remote.nonce, [
                    new JoinGameMessage(
                        this.code,
                        SpecialID.Nil,
                        SpecialID.SaaH
                            ? this.started
                                ? SpecialID.SaaH
                                : remote.clientid
                            : this.hostid
                    ),
                    new RemovePlayerMessage(
                        this.code,
                        SpecialID.Nil,
                        SpecialID.SaaH
                            ? this.started
                                ? SpecialID.SaaH
                                : remote.clientid
                            : this.hostid,
                        DisconnectReason.None
                    ),
                ])
            );
        }
    }

    async broadcast(
        messages: BaseGameDataMessage[],
        reliable = true,
        recipient: PlayerData = null,
        payloads: BaseRootMessage[] = []
    ) {
        if (recipient) {
            const remote = this.remotes.get(recipient.id);
            if (remote) {
                const children = [
                    ...(messages?.length
                        ? [
                              new GameDataToMessage(
                                  this.code,
                                  recipient.id,
                                  messages
                              ),
                          ]
                        : []),
                    ...payloads,
                ];

                await remote.send(
                    reliable
                        ? new ReliablePacket(remote.nonce, children)
                        : new UnreliablePacket(children)
                );
            }
        } else {
            for (const [, remote] of this.remotes) {
                const children = [
                    ...(messages?.length
                        ? [new GameDataMessage(this.code, messages)]
                        : []),
                    ...payloads,
                ];

                await remote.send(
                    reliable
                        ? new ReliablePacket(remote.nonce, children)
                        : new UnreliablePacket(children)
                );
            }
        }
    }
}
