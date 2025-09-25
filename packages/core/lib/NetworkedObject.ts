import { HazelReader, HazelWriter } from "@skeldjs/util";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SpawnType, SpawnFlag } from "@skeldjs/constant";
import { BaseRpcMessage } from "@skeldjs/protocol";
import { BasicEvent, EventEmitter, ExtractEventTypes } from "@skeldjs/events";

import { StatefulRoom, SpecialOwnerId } from "./StatefulRoom";

import { ComponentDespawnEvent, ComponentSpawnEvent } from "./events";
import { Player } from "./Player";

export type NetworkedObjectConstructor<T> = {
    new(
        room: StatefulRoom<any>,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
        data?: HazelReader | any
    ): T;
} | {
    new(
        room: StatefulRoom<any>,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
        data?: HazelReader | any,
        object?: NetworkedObject<any, any>
    ): T;
};

export type NetworkedObjectEvents<RoomType extends StatefulRoom = StatefulRoom> = ExtractEventTypes<
    [ComponentSpawnEvent<RoomType>, ComponentDespawnEvent<RoomType>]
>;

/**
 * Represents a basic networked object in Among Us.
 *
 * See {@link NetworkedObjectEvents} for events to listen to.
 */
export class NetworkedObject<
    DataT = any,
    T extends NetworkedObjectEvents = NetworkedObjectEvents,
    RoomType extends StatefulRoom = StatefulRoom
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
    player?: Player<RoomType>;

    components: NetworkedObject<any, NetworkedObjectEvents, RoomType>[];

    get owner(): StatefulRoom | Player<RoomType> | undefined {
        if (this.ownerId !== SpecialOwnerId.Global) {
            return this.room.players.get(this.ownerId);
        }

        return this.room;
    }

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
        data?: HazelReader | DataT
    ) {
        super();

        this.room = room;
        this.spawnType = spawnType;
        this.netId = netId;
        this.ownerId = ownerId;
        this.flags = flags;

        if (this.ownerId >= 0) {
            this.player = this.owner as Player<RoomType>;
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

    async emitSerial<Event extends BasicEvent>(event: Event): Promise<Event> {
        if (this.player) {
            await this.player.emitSerial(event);
        } else if (this.owner) {
            await this.owner.emitSerial(event);
        }

        return super.emitSerial(event);
    }

    emitSync<Event extends BasicEvent>(event: Event): Event {
        if (this.player) {
            this.player.emitSync(event);
        } else if (this.owner) {
            this.owner.emitSync(event);
        }

        return super.emitSync(event);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    Deserialize(reader: HazelReader, spawn: boolean = false) { }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    Serialize(writer: HazelWriter, spawn: boolean = false): boolean {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    PreSerialize() { }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    async HandleRpc(rpc: BaseRpcMessage) { }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    FixedUpdate(delta: number) { }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Awake() { }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Destroy() { }

    /**
     * Get a certain component from the object.
     * @param component The component class to get.
     */
    getComponent<T extends NetworkedObject>(
        component: NetworkedObjectConstructor<T>
    ): T | undefined {
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

    /**
     * Whether or not this object
     */
    canBeManaged() {
        return this.room.canManageObject(this);
    }
}
