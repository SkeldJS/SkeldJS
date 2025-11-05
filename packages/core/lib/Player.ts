import { BaseGameDataMessage, PlatformSpecificData, ReadyMessage } from "@skeldjs/au-protocol";
import { BasicEvent, EventEmitter, EventMapFromList } from "@skeldjs/events";
import { Platform } from "@skeldjs/au-constants";

import {
    CustomNetworkTransformEvents,
    NetworkedPlayerInfo,
    PlayerControl,
    PlayerControlEvents,
    PlayerPhysicsEvents,
} from "./objects";

import { StatefulRoom } from "./StatefulRoom";

import {
    PlayerJoinEvent,
    PlayerLeaveEvent,
    PlayerReadyEvent,
    PlayerSceneChangeEvent,
    PlayerSetAuthoritativeEvent,
    PlayerSpawnEvent,
} from "./events";

import { NetworkedObjectEvents } from "./NetworkedObject";
import { BaseRole } from "./roles";

export type PlayerEvents<RoomType extends StatefulRoom> = NetworkedObjectEvents<RoomType> &
    PlayerControlEvents<RoomType> &
    PlayerPhysicsEvents<RoomType> &
    CustomNetworkTransformEvents<RoomType> &
    EventMapFromList<
        [
            PlayerReadyEvent<RoomType>,
            PlayerJoinEvent<RoomType>,
            PlayerLeaveEvent<RoomType>,
            PlayerSetAuthoritativeEvent<RoomType>,
            PlayerSceneChangeEvent<RoomType>,
            PlayerSpawnEvent<RoomType>
        ]
    >;

/**
 * Represents the player of a client connected to the room.
 *
 * See {@link PlayerEvents} for events to listen to.
 */
export class Player<RoomType extends StatefulRoom> extends EventEmitter<PlayerEvents<RoomType>> {
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
    characterControl: PlayerControl<RoomType> | undefined;

    /**
     * The actual instance of this player's role manager, see {@link PlayerInfo.roleType}
     * to know which role this is.
     */
    role: BaseRole<RoomType>|undefined;

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

        this.characterControl = undefined;
    }

    async emit<Event extends BasicEvent>(event: Event): Promise<Event> {
        await this.room.emit(event);

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
     * The player's game information, such as dead/impostor/disconnected states,
     * hats, names, pets, etc.
     */
    getPlayerInfo(): NetworkedPlayerInfo<RoomType> | undefined {
        if (this.getPlayerId() === undefined) return undefined;
        return this.room.playerInfo.get(this.getPlayerId()!);
    }

    /**
     * The room-unique player ID of the player.
     */
    getPlayerId() {
        return this.characterControl?.playerId;
    }

    /**
     * Mark as readied up to start the game.
     */
    async setReady() {
        this.isReady = true;
        await this.emit(new PlayerReadyEvent(this.room, this));
    }

    /**
     * Mark, and broadcast, as readied up to start the game.
     */
    async readyUp() {
        await this.setReady();
        await this.room.broadcastImmediate([new ReadyMessage(this.clientId)]);
    }

    /**
     * Despawn all components on the player,
     */
    destroy() {
        if (!this.characterControl)
            return;

        for (const component of this.characterControl.components) {
            this.room.despawnComponent(component);
        }
    }
}
