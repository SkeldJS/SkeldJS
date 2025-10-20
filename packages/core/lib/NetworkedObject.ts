import { HazelReader, HazelWriter } from "@skeldjs/hazel";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SpawnType, SpawnFlag } from "@skeldjs/constant";
import { BaseDataMessage, BaseRpcMessage } from "@skeldjs/protocol";
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

export enum DataState {
    Dormant,
    Spawn,
    Update,
}

export type NetworkedObjectEvents<RoomType extends StatefulRoom> = ExtractEventTypes<
    [ComponentSpawnEvent<RoomType>, ComponentDespawnEvent<RoomType>]
>;

/**
 * Represents a basic networked object in Among Us.
 *
 * See {@link NetworkedObjectEvents} for events to listen to.
 */
export abstract class NetworkedObject<RoomType extends StatefulRoom, T extends NetworkedObjectEvents<RoomType> = NetworkedObjectEvents<RoomType>> extends EventEmitter<T> {
    pendingDataState: DataState;

    /**
     * The player that this component belongs to.
     */
    player: Player<RoomType>|undefined;

    components: NetworkedObject<RoomType, any>[];

    get owner(): StatefulRoom | Player<RoomType> | undefined {
        if (this.ownerId !== SpecialOwnerId.Global) {
            return this.room.players.get(this.ownerId);
        }

        return this.room;
    }

    constructor(
        public readonly room: RoomType,
        public readonly spawnType: SpawnType,
        public readonly netId: number,
        public readonly ownerId: number,
        public readonly flags: number,
    ) {
        super();

        this.pendingDataState = DataState.Dormant;

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

    abstract parseData(state: DataState, reader: HazelReader): BaseDataMessage|undefined;
    abstract handleData(data: BaseDataMessage): Promise<void>;
    abstract createData(state: DataState): BaseDataMessage|undefined;

    abstract parseRemoteCall(rpcTag: number, reader: HazelReader): BaseRpcMessage|undefined;
    abstract handleRemoteCall(rpc: BaseRpcMessage): Promise<void>;

    abstract processFixedUpdate(delta: number): Promise<void>;
    abstract processAwake(): Promise<void>;

    pushDataState(state: DataState): void {
        if (state > this.pendingDataState) {
            this.pendingDataState = state;
        }
    }

    cancelDataState(state: DataState): void {
        if (this.pendingDataState === state) {
            this.pendingDataState = DataState.Dormant;
        }
    }

    resetDataState(): void {
        this.cancelDataState(this.pendingDataState);
    }

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
