import { HazelBuffer, TypedEmitter, TypedEvents } from "@skeldjs/util";
import { RpcMessage } from "@skeldjs/protocol" 

import { SpawnID } from "@skeldjs/constant";

import { Room } from "./Room";

export type NetworkableEvents = {
    
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class Networkable<T extends TypedEvents = {}> extends TypedEmitter<T & NetworkableEvents> {
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
        this.room.emit(event, this, ...args);
        
        return super.emit(event, ...args);
    }

    get owner() {
        return this.room.objects.get(this.ownerid);
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