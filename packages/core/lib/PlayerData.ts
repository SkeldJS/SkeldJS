import { BaseGameDataMessage, PlatformSpecificData, ReadyMessage } from "@skeldjs/protocol";
import { BasicEvent, EventEmitter, ExtractEventTypes } from "@skeldjs/events";
import { Platform } from "@skeldjs/constant";

import {
    CustomNetworkTransform,
    CustomNetworkTransformEvents,
    PlayerControl,
    PlayerControlEvents,
    PlayerPhysics,
    PlayerPhysicsEvents,
} from "./objects";

import { Hostable } from "./Hostable";

import {
    PlayerJoinEvent,
    PlayerLeaveEvent,
    PlayerReadyEvent,
    PlayerSceneChangeEvent,
    PlayerSetHostEvent,
    PlayerSpawnEvent,
} from "./events";

import { NetworkableEvents } from "./Networkable";

export type PlayerDataEvents<RoomType extends Hostable = Hostable> = NetworkableEvents<RoomType> &
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
export class PlayerData<RoomType extends Hostable = Hostable> extends EventEmitter<PlayerDataEvents<RoomType>> {
    /**
     * The room that this player object belongs to.
     */
    room: RoomType;

    /**
     * This player's server-unique client ID.
     */
    clientId: number;

    /**
     * The player's login name, not necessarily the display name, see {@link PlayerInfo}.
     */
    username: string;

    /**
     * The platform that the player is playing on.
     */
    platform: PlatformSpecificData;

    /**
     * The level/rank of the player.
     */
    playerLevel: number;

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

    character: PlayerControl<RoomType>|undefined;

    constructor(
        room: RoomType,
        clientId: number,
        playerName: string,
        platform = new PlatformSpecificData(Platform.Unknown, "Unknown"),
        playerLevel = 0
    ) {
        super();

        this.room = room;
        this.clientId = clientId;
        this.username = playerName;
        this.platform = platform;
        this.playerLevel = playerLevel;

        this.stream = [];
        this.isReady = false;
        this.inScene = false;

        this.character = undefined;

        this.on("component.spawn", () => {
            if (this.hasSpawned) {
                this.emit(new PlayerSpawnEvent(this.room, this));
            }
        });
    }

    async emit<Event extends BasicEvent>(event: Event): Promise<Event> {
        this.room.emit(event);

        return super.emit(event);
    }

    /**
     * The player's control component.
     */
    get control(): PlayerControl<RoomType>|undefined {
        return this.character?.getComponent(PlayerControl) as PlayerControl<RoomType>|undefined;
    }

    /**
     * The player's physics component.
     */
    get physics(): PlayerPhysics<RoomType>|undefined {
        return this.character?.getComponent(PlayerPhysics) as PlayerPhysics<RoomType>|undefined;
    }

    /**
     * The player's movement component.
     */
    get transform(): CustomNetworkTransform<RoomType>|undefined {
        return this.character?.getComponent(CustomNetworkTransform) as CustomNetworkTransform<RoomType>|undefined;
    }

    get isFakePlayer() {
        return this.character && this.clientId === 0;
    }

    /**
     * The player's information.
     */
    get playerInfo() {
        if (this.playerId === undefined)
            return undefined;

        return this.room.gameData?.players?.get(this.playerId);
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
        return this.room.host === this;
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

        if (this.isMe && !this.isHost) {
            await this.room.broadcast([ new ReadyMessage(this.clientId) ]);
        }
    }

    /**
     * Despawn all components on the player,
     */
    destroy() {
        if (!this.character)
            return;

        for (const component of this.character.components) {
            component.despawn();
        }
    }
}
