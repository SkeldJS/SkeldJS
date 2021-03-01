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

export type PlayerDataEvents = PlayerControlEvents & PlayerPhysicsEvents & CustomNetworkTransformEvents &
{
    "player.ready": {};
    "player.join": {};
    "player.leave": {};
    "player.sethost": {};
    "player.scenechange": {};
    "player.spawn": {};
    "component.spawn": {
        component: PlayerControl|PlayerPhysics|CustomNetworkTransform
    };
    "component.despawn": {
        component: PlayerControl|PlayerPhysics|CustomNetworkTransform
    };
}

export class PlayerData extends Heritable<PlayerDataEvents> {
    isReady: boolean;
    inScene: boolean;

    left: boolean;
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
            player: this
        });

        return EventEmitter.prototype.emit.call(this, event, data);
    }

    get control() {
        return this.getComponent(PlayerControl);
    }

    get physics() {
        return this.getComponent(PlayerPhysics);
    }

    get transform() {
        return this.getComponent(CustomNetworkTransform);
    }

    get data() {
        return this.room.gamedata?.players?.get(this.playerId);
    }

    get playerId() {
        return this.control?.playerId;
    }

    get spawned() {
        return !!(this.control && this.physics && this.transform);
    }

    get ishost() {
        return this.room.host === this;
    }

    get isme() {
        return this.id === this.room.me?.id;
    }

    async ready() {
        this.isReady = true;
        this.emit("player.ready", {});

        if (this.isme && !this.ishost) {
            await this.room.broadcast([{
                tag: MessageTag.Ready,
                clientid: this.id
            }]);
        }
    }
}
