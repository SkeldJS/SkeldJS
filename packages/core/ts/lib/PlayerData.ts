import { EventEmitter } from "events";
import { MessageTag, Opcode, PayloadTag } from "@skeldjs/constant";

import {
    CustomNetworkTransform,
    PlayerControl,
    PlayerPhysics,
} from "./component";

import { Heritable } from "./Heritable";
import { Room } from "./Room";
import { PropagatedEmitter } from "@skeldjs/util";

export type PlayerDataEvents = PropagatedEmitter<PlayerControl> &
    PropagatedEmitter<PlayerPhysics> &
    PropagatedEmitter<CustomNetworkTransform> &
 {
    ready: () => void;
    join: () => void;
    leave: () => void;
    setHost: () => void;
    spawn: (component: PlayerControl|PlayerPhysics|CustomNetworkTransform) => void;
    despawn: (component: PlayerControl|PlayerPhysics|CustomNetworkTransform) => void;
}

export class PlayerData extends Heritable<PlayerDataEvents> {
    isReady: boolean;
    inScene: boolean;

    left: boolean;

    constructor(room: Room, clientid: number) {
        super(room, clientid);
    }

    _emit(event: string, ...args: any[]): boolean {
        this.room.emit(event, this, ...args);

        return super.emit(event, ...args);
    }

    emit(event: string, ...args: any[]): boolean {
        return EventEmitter.prototype.emit.call(this, event, ...args);
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
        return this.id === this.room.client.clientid;
    }

    async ready() {
        this.isReady = true;
        this._emit("ready");

        if (this.isme && !this.ishost) {
            await this.room.client.send({
                op: Opcode.Reliable,
                payloads: [
                    {
                        tag: PayloadTag.GameData,
                        code: this.room.code,
                        messages: [
                            {
                                tag: MessageTag.Ready,
                                clientid: this.id
                            }
                        ]
                    }
                ]
            });
        }
    }
}
