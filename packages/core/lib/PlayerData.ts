import { BaseGameDataMessage, ReadyMessage } from "@skeldjs/protocol";

import {
    CustomNetworkTransform,
    CustomNetworkTransformEvents,
    PlayerControl,
    PlayerControlEvents,
    PlayerPhysics,
    PlayerPhysicsEvents,
} from "./objects";

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

export type PlayerDataEvents<RoomType extends Hostable = Hostable> = HeritableEvents<RoomType> &
    PlayerControlEvents<RoomType> &
    PlayerPhysicsEvents<RoomType> &
    CustomNetworkTransformEvents<RoomType> &
    ExtractEventTypes<
        [
            PlayerReadyEvent<RoomType>,
            PlayerJoinEvent<RoomType>,
            PlayerLeaveEvent<RoomType>,
            PlayerSetHostEvent<RoomType>,
            PlayerSceneChangeEvent<RoomType>,
            PlayerSpawnEvent<RoomType>
        ]
    >;

/**
 * Represents the player of a client connected to the room.
 *
 * See {@link PlayerDataEvents} for events to listen to.
 */
export class PlayerData<RoomType extends Hostable = Hostable> extends Heritable<PlayerDataEvents<RoomType>, RoomType> {
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

    constructor(room: RoomType, clientid: number) {
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
    get control(): PlayerControl<RoomType> {
        return this.getComponent(PlayerControl) as PlayerControl<RoomType>;
    }

    /**
     * The player's physics component.
     */
    get physics(): PlayerPhysics<RoomType> {
        return this.getComponent(PlayerPhysics) as PlayerPhysics<RoomType>;
    }

    /**
     * The player's movement component.
     */
    get transform(): CustomNetworkTransform<RoomType> {
        return this.getComponent(CustomNetworkTransform) as CustomNetworkTransform<RoomType>;
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
