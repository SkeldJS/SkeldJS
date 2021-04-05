import { MessageTag } from "@skeldjs/constant";
import { GameDataMessage } from "@skeldjs/protocol";
import { EventEmitter } from "@skeldjs/events";

import {
    CustomNetworkTransform,
    CustomNetworkTransformEvents,
    PlayerControl,
    PlayerControlEvents,
    PlayerPhysics,
    PlayerPhysicsEvents,
} from "./component";

import { Heritable } from "./Heritable";
import { Hostable } from "./Hostable";

type BasePlayerDataEvents = PlayerControlEvents &
    PlayerPhysicsEvents &
    CustomNetworkTransformEvents;

export interface PlayerDataEvents extends BasePlayerDataEvents {
    /**
     * Emitted when the player readies up.
     */
    "player.ready": {};
    /**
     * Emitted when the player joins the game.
     */
    "player.join": {};
    /**
     * Emitted when the player leaves the game.
     */
    "player.leave": {};
    /**
     * Emitted when the player is made the host of the game.
     */
    "player.sethost": {};
    /**
     * Emitted when the player changes scene.
     */
    "player.scenechange": {};
    /**
     * Emitted when the player is fully spawned.
     */
    "player.spawn": {};
    /**
     * Emitted when a component of the player spawns.
     */
    "player.component.spawn": {
        /**
         * The component that spawned.
         */
        component: PlayerControl | PlayerPhysics | CustomNetworkTransform;
    };
    /**
     * Emitted when a component of the player is despawned.
     */
    "player.component.despawn": {
        /**
         * The component that despawned.
         */
        component: PlayerControl | PlayerPhysics | CustomNetworkTransform;
    };
}

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
    stream: GameDataMessage[];

    constructor(room: Hostable, clientid: number) {
        super(room, clientid);

        this.stream = [];

        this.on("component.spawn", () => {
            if (this.spawned) {
                this.emit("player.spawn", {});
            }
        });
    }

    async emit(...args: any[]) {
        const event = args[0];
        const data = args[1];

        this.room.emit(event, {
            ...data,
            player: this,
        });

        return EventEmitter.prototype.emit.call(this, event, data);
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
     * The player's game data.
     */
    get data() {
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
        await this.emit("player.ready", {});

        if (this.isme && !this.ishost) {
            await this.room.broadcast([
                {
                    tag: MessageTag.Ready,
                    clientid: this.id,
                },
            ]);
        }
    }
}
