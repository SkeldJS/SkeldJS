import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { SystemType } from "@skeldjs/constant";
import { BaseDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { EventEmitter, BasicEvent } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { Player } from "../Player";

import { SystemStatusEvents } from "./events";
import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";

export abstract class SystemStatus<RoomType extends StatefulRoom, T extends SystemStatusEvents<RoomType> = SystemStatusEvents<RoomType>> extends EventEmitter<T> {
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

    abstract handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined): Promise<void>;
    abstract handleSabotageByPlayer(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined): Promise<void>;

    abstract processFixedUpdate(delta: number): Promise<void>;

    abstract fullyRepairHost(): Promise<void>;
    abstract fullyRepairPlayer(player: Player<RoomType> | undefined): Promise<void>;
    abstract sendFullRepair(player: Player<RoomType>): Promise<void>;

    /**
     * Sabotage this system.
     */
    async sabotagePlayer(sabotagedByPlayer: Player<RoomType>) {
        await this.ship.systems.get(SystemType.Sabotage)
            ?.handleRepairByPlayer(sabotagedByPlayer, this.systemType, undefined);
    }

    async sabotage() {
        await this.ship.systems.get(SystemType.Sabotage)
            ?._sendRepair(this.systemType);
    }

    protected async _sendRepair(amount: number) {
        await this.room.sendRepairSystem(this.systemType, amount);
    }
}
