import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SpawnType } from "@skeldjs/constant";
import { BaseRpcMessage } from "@skeldjs/protocol";
import { BasicEvent, EventEmitter, ExtractEventTypes } from "@skeldjs/events";

import { Hostable } from "./Hostable";

import { ComponentDespawnEvent, ComponentSpawnEvent } from "./events";
import { PlayerData } from "./PlayerData";

export type NetworkableConstructor<T> = {
    new (
        room: Hostable<any>,
        spawnType: SpawnType,
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | any
    ): T;
}|{
    new (
        room: Hostable<any>,
        spawnType: SpawnType,
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | any,
        object?: Networkable<any, any>
    ): T;
};

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
    /**
     * The room that this component belongs to.
     */
    room: RoomType;

    /**
     * The type of object that this component belongs to.
     */
    spawnType: SpawnType;

    /**
     * The net ID of this component.
     */
    netId: number;

    /**
     * The ID of the owner of this component.
     */
    ownerId: number;

    /**
     * Flags for this object, see {@link SpawnFlag}.
     */
    flags: number;

    /**
     * The dirty state of this component.
     */
    dirtyBit: number = 0;

    /**
     * The player that this component belongs to.
     */
    player?: PlayerData<RoomType>;

    components: Networkable<any, NetworkableEvents, RoomType>[];

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | DataT
    ) {
        super();

        this.room = room;
        this.spawnType = spawnType;
        this.netId = netid;
        this.ownerId = ownerid;
        this.flags = flags;

        if (this.ownerId > -2) {
            this.player = this.owner as PlayerData<RoomType>;
        } else {
            this.player = undefined;
        }

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
        if (this.player) {
            await this.player.emit(event);
        } else if (this.owner) {
            await this.owner.emit(event);
        }

        return super.emit(event);
    }

    get owner(): Hostable|PlayerData<RoomType>|undefined {
        if (this.ownerId !== -2) {
            return this.room.players.get(this.ownerId);
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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Awake() {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Destroy() {}

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
