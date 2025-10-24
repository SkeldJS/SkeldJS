import { HazelReader } from "@skeldjs/hazel";
import { SystemType } from "@skeldjs/constant";
import { BaseSystemMessage, SabotageSystemMessage } from "@skeldjs/protocol";
import { EventEmitter, BasicEvent, ExtractEventTypes, EventData } from "@skeldjs/events";

import { InnerShipStatus, PlayerControl } from "../objects";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";


export type SystemStatusEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

export abstract class SystemStatus<RoomType extends StatefulRoom, T extends EventData = {}> extends EventEmitter<SystemStatusEvents<RoomType> & T> {
    isDirty: boolean = false;

    constructor(
        public readonly shipStatus: InnerShipStatus<RoomType>,
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
            this.shipStatus.emit(event as any);
        }

        return super.emit(event);
    }

    async emitSerial<Event extends BasicEvent>(event: Event): Promise<Event> {
        if (this.shipStatus) {
            this.shipStatus.emitSerial(event as any);
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

export abstract class SabotagableSystem<RoomType extends StatefulRoom, T extends EventData = {}> extends SystemStatus<RoomType, T> {
    canBeSabotaged(): this is SabotagableSystem<RoomType, T> {
        return true;
    }

    abstract isSabotaged(): boolean;

    /**
     * Sabotage this system. This is an authoritative operation and can result in
     * a client being banned for hacking if called improperly.
     */
    abstract sabotageWithAuth(): Promise<void>;

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
     * from the room authority. Calls {@link sabotageWithAuth} or {@link sabotageRequest}.
     */
    async sabotage(): Promise<void> {
        if (this.room.canManageObject(this.shipStatus)) {
            await this.sabotageWithAuth();
        } else {
            await this.sabotageRequest();
        }
    }

    abstract fullyRepairWithAuth(): Promise<void>;
    abstract fullyRepairRequest(): Promise<void>;

    async fullyRepair(): Promise<void> {
        if (this.room.canManageObject(this.shipStatus)) {
            await this.fullyRepairWithAuth();
        } else {
            await this.fullyRepairRequest();
        }
    }
}