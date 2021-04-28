import { HazelBuffer, HazelReader } from "@skeldjs/util";
import { RpcMessageTag, SpawnType } from "@skeldjs/constant";

import {
    EventEmitter,
    ExtractEventTypes,
} from "@skeldjs/events";

import { Hostable } from "./Hostable";

import { NetworkableDespawnEvent, NetworkableSpawnEvent } from "./events";

export type NetworkableEvents = ExtractEventTypes<[
    NetworkableSpawnEvent,
    NetworkableDespawnEvent
]>;

/**
 * Represents a basic networkable object in Among Us.
 *
 * See {@link NetworkableEvents} for events to listen to.
 */
export class Networkable<
    DataT = any,
    T extends NetworkableEvents = NetworkableEvents
> extends EventEmitter<T> {
    static type: SpawnType;
    /**
     * The type of object that this component belongs to.
     */
    type: SpawnType;

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
        room: Hostable<any>,
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

    async emit<EventName extends keyof NetworkableEvents>(
        event: NetworkableEvents[EventName]
    );
    async emit<EventName extends keyof T>(
        event: T[EventName]
    );
    async emit<EventName extends keyof T>(
        event: T[EventName]
    ) {
        if (this.owner) {
            this.owner.emit(event);
        }

        return super.emit(event);
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
    HandleRpc(callid: RpcMessageTag, reader: HazelReader) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    FixedUpdate(delta: number) {}

    /**
     * Spawn this component if does not exist in the room it belongs in.
     */
    async spawn(): Promise<void> {
        return await this.room.spawnComponent(this);
    }

    /**
     * Despawns the component from the room it belongs in.
     */
    async despawn(): Promise<void> {
        return await this.room.despawnComponent(this);
    }
}
