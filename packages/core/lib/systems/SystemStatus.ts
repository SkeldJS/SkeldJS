import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { SystemType } from "@skeldjs/constant";
import { BaseDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { EventEmitter, BasicEvent, ExtractEventTypes, EventData } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { Player } from "../Player";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";


export type SystemStatusEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

export abstract class SystemStatus<RoomType extends StatefulRoom, T extends EventData = {}> extends EventEmitter<SystemStatusEvents<RoomType> & T> {
    private _isDirty: boolean;

    systemType: SystemType;

    constructor(
        protected ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
    ) {
        super();

        this.systemType = systemType;
        this._isDirty = false;
    }

    get isDirty() {
        return this._isDirty;
    }

    private set isDirty(isDirty: boolean) {
        this._isDirty = isDirty;
        this.ship.pushDataState(DataState.Update);
    }

    /**
     * Whether or not this system is sabotaged.
     */
    get sabotaged() {
        return false;
    }

    /**
     * Return the room that this system belongs to.
     */
    get room() {
        return this.ship.room;
    }

    async emit<Event extends BasicEvent>(event: Event): Promise<Event> {
        if (this.ship) {
            this.ship.emit(event as any);
        }

        return super.emit(event);
    }

    async emitSerial<Event extends BasicEvent>(event: Event): Promise<Event> {
        if (this.ship) {
            this.ship.emitSerial(event as any);
        }

        return super.emitSerial(event);
    }

    emitSync<Event extends BasicEvent>(event: Event): Event {
        if (this.ship) {
            this.ship.emitSync(event as any);
        }

        return super.emitSync(event);
    }

    pushDataUpdate() {
        this.isDirty = true;
        this.ship.pushDataState(DataState.Update);
    }

    cancelDataUpdate() {
        this.isDirty = false;
    }

    abstract parseData(dataState: DataState, reader: HazelReader): BaseDataMessage|undefined;
    abstract handleData(data: BaseDataMessage): Promise<void>;
    abstract createData(dataState: DataState): BaseDataMessage|undefined;
}
