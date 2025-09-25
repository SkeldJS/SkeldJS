import { BaseGameDataMessage, PlatformSpecificData, ReadyMessage } from "@skeldjs/protocol";
import { BasicEvent, EventEmitter, ExtractEventTypes } from "@skeldjs/events";
import { Platform } from "@skeldjs/constant";

import {
    CustomNetworkTransform,
    CustomNetworkTransformEvents,
    NetworkedPlayerInfo,
    PlayerControl,
    PlayerControlEvents,
    PlayerPhysics,
    PlayerPhysicsEvents,
} from "./objects";

import { StatefulRoom } from "./StatefulRoom";

import {
    PlayerJoinEvent,
    PlayerLeaveEvent,
    PlayerReadyEvent,
    PlayerSceneChangeEvent,
    PlayerSetHostEvent,
    PlayerSpawnEvent,
} from "./events";

import { NetworkedObjectEvents } from "./NetworkedObject";
import { BaseRole } from "./roles";

export type PlayerEvents<RoomType extends StatefulRoom = StatefulRoom> = NetworkedObjectEvents<RoomType> &
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
 * See {@link PlayerEvents} for events to listen to.
 */
export class Player<RoomType extends StatefulRoom = StatefulRoom> extends EventEmitter<PlayerEvents<RoomType>> {
    /**
     * The room that this player object belongs to.
     */
    room: RoomType;

    /**
     * Whether or not this player is readied up to start the game.
     */
    isReady: boolean;

    /**
     * Whether or not this player is in the game scene.
     */
    inScene: boolean;

    /**
     * The message stream to be sent on fixed update.
     */
    stream: BaseGameDataMessage[];

    /**
     * This player's player control component.
     */
    control: PlayerControl<RoomType> | undefined;

    /**
     * The actual instance of this player's role manager, see {@link PlayerInfo.roleType}
     * to know which role this is.
     */
    role?: BaseRole;

    constructor(
        room: RoomType,
        /**
         * This player's server-unique client ID.
         */
        public readonly clientId: number,
        /**
         * The player's login name, not necessarily the display name, see {@link PlayerInfo}.
         */
        public readonly username: string,
        /**
         * The platform that the player is playing on.
         */
        public readonly platform = new PlatformSpecificData(Platform.Unknown, "Unknown"),
        /**
         * The level/rank of the player.
         */
        public readonly playerLevel = 0,
        /**
         * The player's innersloth friend code.
         */
        public readonly friendCode = "",
        /**
         * The player's unique global UUID.
         */
        public readonly puid = ""
    ) {
        super();

        this.room = room;

        this.stream = [];
        this.isReady = false;
        this.inScene = false;

        this.control = undefined;

        this.on("component.spawn", () => {
            if (this.hasSpawned) {
                this.emitSync(new PlayerSpawnEvent(this.room, this));
            }
        });
    }

    async emit<Event extends BasicEvent>(event: Event): Promise<Event> {
        this.room.emit(event);

        return super.emit(event);
    }

    async emitSerial<Event extends BasicEvent>(event: Event): Promise<Event> {
        this.room.emitSerial(event);

        return super.emitSerial(event);
    }

    emitSync<Event extends BasicEvent>(event: Event): Event {
        this.room.emitSync(event);

        return super.emitSync(event);
    }

    /**
     * The player's physics component.
     */
    get physics(): PlayerPhysics<RoomType> | undefined {
        return this.control?.getComponent(PlayerPhysics) as PlayerPhysics<RoomType> | undefined;
    }

    /**
     * The player's movement component.
     */
    get transform(): CustomNetworkTransform<RoomType> | undefined {
        return this.control?.getComponent(CustomNetworkTransform) as CustomNetworkTransform<RoomType> | undefined;
    }

    /**
     * Whether or not this player is a fake player, as in they are entirely
     * client-side and have no real player behind them.
     */
    get isFakePlayer() {
        return this.control && this.clientId === 0;
    }

    /**
     * The player's game information, such as dead/impostor/disconnected states,
     * hats, names, pets, etc.
     */
    getPlayerInfo(): NetworkedPlayerInfo | undefined {
        if (this.playerId === undefined) return undefined;
        return this.room.playerInfo.get(this.playerId);
    }

    /**
     * Shorthand for `player.playerInfo.defaultOutfit.name`.
     *
     * This will return the player's name as it appears in-game, not including
     * the name of the player that they might have shapeshifted into.
     */
    get playerName() {
        return this.getPlayerInfo()?.defaultOutfit.name;
    }

    /**
     * The room-unique player ID of the player.
     */
    get playerId() {
        return this.control?.playerId;
    }

    /**
     * Whether or not the player has fully spawned.
     */
    get hasSpawned() {
        return !!(this.control && this.physics && this.transform);
    }

    /**
     * Whether or not the player is the host of the room they belong in.
     */
    get isHost() {
        return this.room.playerAuthority === this;
    }

    /**
     * Whether or not the player is the current client's player.
     */
    get isMe() {
        return this.room.myPlayer === this;
    }

    /**
     * Mark as readied up to start the game.
     */
    async setReady() {
        this.isReady = true;
        await this.emit(new PlayerReadyEvent(this.room, this));

        if (this.isMe) {
            await this.room.broadcast([new ReadyMessage(this.clientId)]);
        }
    }

    /**
     * Despawn all components on the player,
     */
    destroy() {
        if (!this.control)
            return;

        for (const component of this.control.components) {
            component.despawn();
        }
    }
}
