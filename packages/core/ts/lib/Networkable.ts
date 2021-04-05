import { HazelBuffer } from "@skeldjs/util";
import { RpcMessage } from "@skeldjs/protocol";
import { SpawnID } from "@skeldjs/constant";

import { EventEmitter } from "@skeldjs/events";

import { Hostable } from "./Hostable";

export interface NetworkableEvents {
    /**
     * Emitted when this component is spawned.
     */
    "component.spawn": {};
    /**
     * Emitted when this component is despawned.
     */
    "component.despawn": {};
}

/**
 * Represents a basic networkable object in Among Us.
 *
 * See {@link NetworkableEvents} for events to listen to.
 */
export class Networkable<
    DataT = any,
    T extends Record<string, any> = {}
> extends EventEmitter<T & NetworkableEvents> {
    static type: SpawnID;
    /**
     * The type of object that this component belongs to.
     */
    type: SpawnID;

    static classname: string;
    /**
     * The class name of this component.
     */
    classname: string;

    /**
     * The room that this component belongs to.
     */
    room: Hostable;

    /**
     * The net ID of this component.
     */
    netid: number;

    /**
     * The ID of the owner of this component.
     */
    ownerid: number;

    /**
     * The dirty state of this component.
     */
    dirtyBit: number = 0;

    constructor(
        room: Hostable,
        netid: number,
        ownerid: number,
        data?: HazelBuffer | DataT
    ) {
        super();

        this.room = room;
        this.netid = netid;
        this.ownerid = ownerid;

        if (data) {
            if (data instanceof HazelBuffer) {
                this.Deserialize(data, true);
            } else {
                this.patch(data);
            }
        }
    }

    protected patch(data: DataT) {
        Object.assign(this, data);
    }

    async emit(...args: any) {
        const event = args[0];
        const data = args[1];

        if (this.owner) {
            await this.owner.emit(event, {
                ...data,
                component: this,
            });
        }

        return super.emit(event, data);
    }

    get owner() {
        return this.room.objects.get(this.ownerid);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    Deserialize(reader: HazelBuffer, spawn: boolean = false) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    Serialize(writer: HazelBuffer, spawn: boolean = false): boolean {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    PreSerialize() {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    HandleRpc(message: RpcMessage) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    FixedUpdate(delta: number) {}

    /**
     * Spawn this component if does not exist in the room it belongs in.
     */
    async spawn() {
        return await this.room.spawnComponent(this);
    }

    /**
     * Despawns the component from the room it belongs in.
     */
    async despawn() {
        return await this.room.despawnComponent(this);
    }
}
