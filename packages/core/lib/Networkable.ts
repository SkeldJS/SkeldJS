import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SpawnType } from "@skeldjs/constant";
import { BaseRpcMessage } from "@skeldjs/protocol";
import { BasicEvent, EventEmitter, ExtractEventTypes } from "@skeldjs/events";

import { Hostable } from "./Hostable";

import { ComponentDespawnEvent, ComponentSpawnEvent } from "./events";
import { PlayerData } from "./PlayerData";
import { NetworkableConstructor } from "./Heritable";

export type NetworkableEvents<RoomType extends Hostable = Hostable> = ExtractEventTypes<
    [ComponentSpawnEvent<RoomType>, ComponentDespawnEvent<RoomType>]
>;

/**
 * Represents a basic networkable object in Among Us.
 *
 * See {@link NetworkableEvents} for events to listen to.
 */
export class Networkable<
    DataT = any,
    T extends NetworkableEvents = NetworkableEvents,
    RoomType extends Hostable = Hostable
> extends EventEmitter<T> {
    static type: SpawnType;
    /**
     * The type of object that this component belongs to.
     */
    type!: SpawnType;

    static classname: string;
    /**
     * The class name of this component.
     */
    classname!: string;

    /**
     * The room that this component belongs to.
     */
    room: RoomType;

    /**
     * The net ID of this component.
     */
    netid: number;

    /**
     * The ID of the owner of this component.
     */
    ownerid: number;

    /**
     * Flags for this object, see {@link SpawnFlag}.
     */
    flags: number;

    /**
     * The dirty state of this component.
     */
    dirtyBit: number = 0;

    components: Networkable<any, NetworkableEvents, RoomType>[];

    constructor(
        room: RoomType,
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | DataT
    ) {
        super();

        this.room = room;
        this.netid = netid;
        this.ownerid = ownerid;
        this.flags = flags;

        this.components = [];

        if (data) {
            if (data instanceof HazelReader) {
                this.Deserialize(data, true);
            } else {
                this.patch(data);
            }
        }
    }

    protected patch(data: DataT) {
        Object.assign(this, data);
    }

    async emit<Event extends BasicEvent>(event: Event): Promise<Event> {
        if (this.owner) {
            this.owner.emit(event);
        }

        return super.emit(event);
    }

    get owner(): Hostable|PlayerData<RoomType>|undefined {
        if (this.ownerid !== -2) {
            return this.room.players.get(this.ownerid);
        }

        return this.room;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    Deserialize(reader: HazelReader, spawn: boolean = false) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    Serialize(writer: HazelWriter, spawn: boolean = false): boolean {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    PreSerialize() {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    async HandleRpc(rpc: BaseRpcMessage) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    FixedUpdate(delta: number) {}

    /**
     * Get a certain component from the object.
     * @param component The component class to get.
     */
    getComponent<T extends Networkable>(
        component: NetworkableConstructor<T>
    ): T|undefined {
        for (const comp of this.components) {
            if (comp instanceof component) {
                return comp;
            }
        }
        
        return undefined;
    }

    /**
     * Spawn this component if does not exist in the room it belongs in.
     */
    spawn(): void {
        return this.room.spawnComponent(this);
    }

    /**
     * Despawns the component from the room it belongs in.
     */
    despawn(): void {
        return this.room.despawnComponent(this);
    }
}
