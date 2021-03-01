import { HazelBuffer } from "@skeldjs/util";
import { RpcMessage } from "@skeldjs/protocol"
import { SpawnID } from "@skeldjs/constant";

import Emittery from "emittery";

import { Hostable } from "./Hostable";

export type NetworkableEvents = {
    "component.spawn": {};
    "component.despawn": {};
}

export class Networkable<T extends Record<string, any> = any> extends Emittery<T & NetworkableEvents> {
    static type: SpawnID;
    type: SpawnID;

    static classname: string;
    classname: string;

    room: Hostable;
    netid: number;
    ownerid: number;

    dirtyBit: number = 0;

    constructor(room: Hostable, netid: number, ownerid: number, data?: HazelBuffer|any) {
        super();

        this.room = room;
        this.netid = netid;
        this.ownerid = ownerid;

        if (data) {
            if ((data as HazelBuffer).buffer) {
                this.Deserialize(data, true);
            } else {
                Object.assign(this, data);
            }
        }
    }

    async emit(...args: any) {
        const event = args[0];
        const data = args[1];

        if (this.owner) await this.owner.emit(event, {
            ...data,
            component: this
        });

        return super.emit(event, data);
    }

    get owner() {
        return this.room.objects.get(this.ownerid);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    Deserialize(reader: HazelBuffer, spawn: boolean = false) {  }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    Serialize(writer: HazelBuffer, spawn: boolean = false): boolean { return false; }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    PreSerialize() { }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    HandleRPC(message: RpcMessage) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    FixedUpdate(delta: number) {}

    spawn() {
        this.room.spawnComponent(this);
    }

    despawn() {
        this.room.despawnComponent(this);
    }
}
