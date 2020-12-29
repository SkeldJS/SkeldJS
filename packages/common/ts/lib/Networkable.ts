import { EventEmitter } from "events"

import { HazelBuffer } from "@skeldjs/util";
import { RpcMessage } from "@skeldjs/protocol"

import { SpawnID } from "@skeldjs/constant";

import { Heritable } from "./Heritable";
import { Room } from "./Room";

export class Networkable<OwnerType extends Heritable = Heritable> extends EventEmitter {
    static type: SpawnID;
    type: SpawnID;
    
    static classname: string;
    classname: string;

    room: Room;
    netid: number;
    ownerid: number;

    dirtyBit: number = 0;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|any) {
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

    emit(event: string, ...args: any[]): boolean {
        this.owner.emit(event, this, ...args);
        
        return super.emit(event, ...args);
    }

    get owner() {
        return this.room.objects.get(this.ownerid) as OwnerType;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    Deserialize(reader: HazelBuffer, spawn: boolean = false) {  }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    Serialize(writer: HazelBuffer, spawn: boolean = false) { }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    HandleRPC(message: RpcMessage) {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    FixedUpdate() {}

    spawn() {
        this.room.spawnComponent(this);
    }

    despawn() {
        this.room.despawnComponent(this);
    }
}