import { BaseGameDataMessage, ReadyMessage } from "@skeldjs/protocol";

import {
    CustomNetworkTransform,
    CustomNetworkTransformEvents,
    PlayerControl,
    PlayerControlEvents,
    PlayerPhysics,
    PlayerPhysicsEvents,
} from "./component";

import { Heritable, HeritableEvents } from "./Heritable";
import { Hostable } from "./Hostable";

import {
    PlayerJoinEvent,
    PlayerLeaveEvent,
    PlayerReadyEvent,
    PlayerSceneChangeEvent,
    PlayerSetHostEvent,
    PlayerSpawnEvent,
} from "./events";
import { ExtractEventTypes } from "@skeldjs/events";

export type PlayerDataEvents = HeritableEvents &
    PlayerControlEvents &
    PlayerPhysicsEvents &
    CustomNetworkTransformEvents &
    ExtractEventTypes<
        [
            PlayerReadyEvent,
            PlayerJoinEvent,
            PlayerLeaveEvent,
            PlayerSetHostEvent,
            PlayerSceneChangeEvent,
            PlayerSpawnEvent
        ]
    >;

/**
 * Represents the player of a client connected to the room.
 *
 * See {@link PlayerDataEvents} for events to listen to.
 */
export class PlayerData extends Heritable<PlayerDataEvents> {
    /**
     * Whether or not this player is readied up to start the game.
     */
    isReady: boolean;

    /**
     * Whether or not this player is in the game scene.
     */
    inScene: boolean;

    /**
     * Whether or not this player has left the game.
     */
    left: boolean;

    /**
     * The message stream to be sent on fixed update.
     */
    stream: BaseGameDataMessage[];

    constructor(room: Hostable<any>, clientid: number) {
        super(room, clientid);

        this.stream = [];
        this.isReady = false;
        this.inScene = false;
        this.left = false;

        this.on("component.spawn", () => {
            if (this.spawned) {
                this.emit(new PlayerSpawnEvent(this.room, this));
            }
        });
    }

    /**
     * The player's control component.
     */
    get control() {
        return this.getComponent(PlayerControl);
    }

    /**
     * The player's physics component.
     */
    get physics() {
        return this.getComponent(PlayerPhysics);
    }

    /**
     * The player's movement component.
     */
    get transform() {
        return this.getComponent(CustomNetworkTransform);
    }

    /**
     * The player's information.
     */
    get info() {
        if (this.playerId === undefined) return undefined;

        return this.room.gamedata?.players?.get(this.playerId);
    }

    /**
     * The player ID of the player.
     */
    get playerId() {
        return this.control?.playerId;
    }

    /**
     * Whether or not the player has fully spawned.
     */
    get spawned() {
        return !!(this.control && this.physics && this.transform);
    }

    /**
     * Whether or not the player is the host of the room they belong in.
     */
    get ishost() {
        return this.room.hostid === this.id;
    }

    /**
     * Whether or not the player is the current client's player.
     */
    get isme() {
        return this.id === this.room.me?.id;
    }

    /**
     * Mark as readied up to start the game.
     */
    async ready() {
        this.isReady = true;
        await this.emit(new PlayerReadyEvent(this.room, this));

        if (this.isme && !this.ishost) {
            await this.room.broadcast([new ReadyMessage(this.id)]);
        }
    }
}
