import { HazelReader, HazelWriter } from "@skeldjs/util";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SpawnType, SpawnFlag, RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "@skeldjs/protocol";
import { BasicEvent, EventEmitter, ExtractEventTypes } from "@skeldjs/events";

import { StatefulRoom, SpecialOwnerId } from "./StatefulRoom";

import { ComponentDespawnEvent, ComponentSpawnEvent } from "./events";
import { Player } from "./Player";

export type NetworkedObjectConstructor<T> = {
    new(
        room: StatefulRoom,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
    ): T;
};

export type NetworkedObjectEvents<RoomType extends StatefulRoom> = ExtractEventTypes<
    [ComponentSpawnEvent<RoomType>, ComponentDespawnEvent<RoomType>]
>;

/**
 * Represents a basic networked object in Among Us.
 *
 * See {@link NetworkedObjectEvents} for events to listen to.
 */
export abstract class NetworkedObject<RoomType extends StatefulRoom, T extends NetworkedObjectEvents<RoomType> = NetworkedObjectEvents<RoomType>> extends EventEmitter<T> {
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

    components: NetworkedObject<RoomType, any>[];

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

    abstract deserializeFromReader(reader: HazelReader, spawn: boolean): void;
    abstract serializeToWriter(writer: HazelWriter, spawn: boolean): boolean;
    abstract parseRemoteCall(rpcTag: number, reader: HazelReader): BaseRpcMessage|undefined;
    abstract handleRemoteCall(rpc: BaseRpcMessage): Promise<void>;
    abstract processFixedUpdate(delta: number): Promise<void>;
    abstract processAwake(): Promise<void>;
    Destroy() { }

    /**
     * Get a certain component from the object.
     * @param ComponentType The component class to get.
     */
    getComponentSafe<T>(
        index: number,
        ComponentType: NetworkedObjectConstructor<T>,
    ): T | undefined {
        const component = this.components[index];
        if (!component) return undefined;
        if (!(component instanceof ComponentType)) return undefined;
        return component;
    }
}
