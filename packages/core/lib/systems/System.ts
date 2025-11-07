import { HazelReader } from "@skeldjs/hazel";
import { SystemType } from "@skeldjs/au-constants";
import { BaseDataMessage, BaseSystemMessage, SabotageSystemMessage, SystemDataMessage, UpdateSystemMessage } from "@skeldjs/au-protocol";
import { EventEmitter, BasicEvent, EventMapFromList, EventMap } from "@skeldjs/events";

import { ShipStatus, PlayerControl } from "../objects";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";
import { SystemRepairEvent, SystemSabotageEvent } from "../events/systems";
import { SabotageSystem } from "./Sabotage";

export type SystemEvents<RoomType extends StatefulRoom> = EventMapFromList<[]>;

export abstract class System<RoomType extends StatefulRoom, T extends EventMap = {}> extends EventEmitter<SystemEvents<RoomType> & T> {
    isDirty: boolean = false;

    constructor(
        public readonly shipStatus: ShipStatus<RoomType>,
        public readonly systemType: SystemType,
    ) {
        super();
    }

    /**
     * Return the room that this system belongs to.
     */
    get room() {
        return this.shipStatus.room;
    }

    async emit<Event extends BasicEvent>(event: Event): Promise<Event> {
        if (this.shipStatus) {
            await this.shipStatus.emit(event as any);
        }

        return super.emit(event);
    }

    async emitSerial<Event extends BasicEvent>(event: Event): Promise<Event> {
        if (this.shipStatus) {
            await this.shipStatus.emitSerial(event as any);
        }

        return super.emitSerial(event);
    }

    emitSync<Event extends BasicEvent>(event: Event): Event {
        if (this.shipStatus) {
            this.shipStatus.emitSync(event as any);
        }

        return super.emitSync(event);
    }

    pushDataUpdate() {
        this.isDirty = true;
        this.shipStatus.pushDataState(DataState.Update);
    }

    cancelDataUpdate() {
        this.isDirty = false;
    }

    abstract parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage|undefined;
    abstract handleData(data: BaseSystemMessage): Promise<void>;
    abstract createData(dataState: DataState): BaseSystemMessage|undefined;

    abstract parseUpdate(reader: HazelReader): BaseSystemMessage|undefined;
    abstract handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void>;

    abstract processFixedUpdate(deltaSeconds: number): Promise<void>;

    async sendUpdateSystem(message: BaseSystemMessage) {
        await this.room.sendUpdateSystemImpl(this.systemType, message);
    }

    canBeSabotaged(): this is SabotagableSystem<RoomType, T> {
        return false;
    }
}

export type SabotagableSystemEvents<RoomType extends StatefulRoom> = EventMapFromList<[
    SystemSabotageEvent<RoomType>,
    SystemRepairEvent<RoomType>,
]>;

export abstract class SabotagableSystem<RoomType extends StatefulRoom, T extends EventMap = {}> extends System<RoomType, T> {
    canBeSabotaged(): this is SabotagableSystem<RoomType, T> {
        return true;
    }

    abstract isCritical(): boolean;
    abstract isSabotaged(): boolean;

    abstract _handleData(data: BaseDataMessage): Promise<void>;
    abstract _handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void>;

    private async _emitSabotageEvents(fn: () => Promise<void>, player: Player<RoomType>|null, message: BaseSystemMessage|BaseDataMessage|null): Promise<void> {
        const beforeSabotaged = this.isSabotaged();
        await fn();
        if (!beforeSabotaged && this.isSabotaged()) {
            const ev = await this.emit(
                new SystemSabotageEvent(
                    this,
                    message,
                    player,
                )
            );

            if (ev.pendingRevert) await this.fullyRepair();
        } else if (beforeSabotaged && !this.isSabotaged()) {
            const ev = await this.emit(
                new SystemRepairEvent(
                    this,
                    message,
                    player,
                )
            );

            if (ev.pendingRevert) await this.sabotage();
        }
    }
    
    async handleData(data: BaseDataMessage): Promise<void> {
        await this._emitSabotageEvents(async () => await this._handleData(data), null, data);
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        await this._emitSabotageEvents(async () => await this._handleUpdate(player, message), player, message);
    }

    /**
     * Sabotage this system. This is an authoritative operation and can result in
     * a client being banned for hacking if called improperly.
     */
    protected abstract _sabotageWithAuth(): Promise<void>;

    async sabotageWithAuth(): Promise<void> {
        const sabotageSystem = this.shipStatus.systems.get(SystemType.Sabotage) as SabotageSystem<RoomType>|undefined;
        if (sabotageSystem) await sabotageSystem.sabotageSystemWithAuth(this);
    }

    /**
     * Ask the authority of the room to sabotage this system.
     */
    async sabotageRequest(): Promise<void> {
        const sabotageSystem = this.shipStatus.systems.get(SystemType.Sabotage) as SabotageSystem<RoomType>|undefined;
        if (sabotageSystem) await sabotageSystem.sabotageSystemRequest(this);
    }

    /**
     * Sabotage this system, either as the room authority or by requesting a sabotage
     * from the room authority. Calls {@link _sabotageWithAuth} or {@link sabotageRequest}.
     */
    async sabotage(): Promise<void> {
        if (this.room.canManageObject(this.shipStatus)) {
            await this._sabotageWithAuth();
        } else {
            await this.sabotageRequest();
        }
    }

    protected abstract _fullyRepairWithAuth(): Promise<void>;
    abstract fullyRepairRequest(): Promise<void>;
    
    async fullyRepairWithAuth(): Promise<void> {
        await this._emitSabotageEvents(async () => await this._fullyRepairWithAuth(), null, null);
    }

    async fullyRepair(): Promise<void> {
        if (this.room.canManageObject(this.shipStatus)) {
            await this._fullyRepairWithAuth();
        } else {
            await this.fullyRepairRequest();
        }
    }
}