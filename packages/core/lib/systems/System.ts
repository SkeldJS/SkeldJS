import { HazelReader } from "@skeldjs/hazel";
import { SystemType } from "@skeldjs/au-constants";
import { BaseSystemMessage, SabotageSystemMessage } from "@skeldjs/au-protocol";
import { EventEmitter, BasicEvent, EventMapFromList, EventMap } from "@skeldjs/events";

import { ShipStatus, PlayerControl } from "../objects";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";
import { SystemRepairEvent, SystemSabotageEvent } from "../events/systems";

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

    abstract _handleData(data: BaseSystemMessage): Promise<void>;
    abstract _handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void>;

    private async emitSabotageEvents(fn: () => Promise<void>): Promise<void> {
        const beforeSabotaged = this.isSabotaged();
        await fn();
        if (!beforeSabotaged && this.isSabotaged()) {
            const ev = await this.emit(
                new SystemSabotageEvent(
                    this.room,
                    this.shipStatus,
                    this,
                )
            );

            if (ev.reverted) await this.fullyRepair();
        } else if (beforeSabotaged && !this.isSabotaged()) {
            const ev = await this.emit(
                new SystemRepairEvent(
                    this.room,
                    this.shipStatus,
                    this,
                )
            );

            if (ev.reverted) await this.sabotage();
        }
    }
    
    async handleData(data: BaseSystemMessage): Promise<void> {
        await this.emitSabotageEvents(async () => await this._handleData(data));
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        await this.emitSabotageEvents(async () => await this._handleUpdate(player, message));
    }

    /**
     * Sabotage this system. This is an authoritative operation and can result in
     * a client being banned for hacking if called improperly.
     */
    protected abstract _sabotageWithAuth(): Promise<void>;

    async sabotageWithAuth(): Promise<void> {
        await this.emitSabotageEvents(async () => await this._sabotageWithAuth());
    }

    /**
     * Ask the authority of the room to sabotage this system.
     */
    async sabotageRequest(): Promise<void> {
        const sabotageSystem = this.shipStatus.systems.get(SystemType.Sabotage);
        if (sabotageSystem) {
            await sabotageSystem.sendUpdateSystem(new SabotageSystemMessage(this.systemType));
        }
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
        await this.emitSabotageEvents(async () => await this._fullyRepairWithAuth());
    }

    async fullyRepair(): Promise<void> {
        if (this.room.canManageObject(this.shipStatus)) {
            await this._fullyRepairWithAuth();
        } else {
            await this.fullyRepairRequest();
        }
    }
}