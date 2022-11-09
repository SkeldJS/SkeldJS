import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage, RpcMessage } from "@skeldjs/protocol";
import { EventEmitter, BasicEvent } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { PlayerData } from "../PlayerData";

import { SystemStatusEvents } from "./events";
import { Hostable } from "../Hostable";

export class SystemStatus<
    DataT = any,
    T extends SystemStatusEvents = SystemStatusEvents,
    RoomType extends Hostable<any> = Hostable<any>
> extends EventEmitter<T> {
    private _dirty: boolean;

    systemType: SystemType;

    constructor(
        protected ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | DataT
    ) {
        super();

        if (data) {
            if (data instanceof HazelReader) {
                this.Deserialize(data, true);
            } else {
                this.patch(data);
            }
        }

        this.systemType = systemType;
        this._dirty = false;
    }

    get dirty() {
        return this._dirty;
    }

    set dirty(isDirty: boolean) {
        this._dirty = isDirty;
        this.ship.dirtyBit = 1;
    }

    protected patch(data: DataT) {
        Object.assign(this, data);
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

    Deserialize(reader: HazelReader, spawn: boolean): void {
        void reader, spawn;
    }

    Serialize(writer: HazelWriter, spawn: boolean): void {
        void writer, spawn;
    }

    async HandleRepair(player: PlayerData|undefined, amount: number, rpc: RepairSystemMessage|undefined): Promise<void> {
        void player, amount, rpc;
    }

    Detoriorate(delta: number): void {
        void delta;
    }

    async HandleSabotage(player: PlayerData|undefined, rpc: RepairSystemMessage|undefined): Promise<void> {
        void player, rpc;
    }

    /**
     * Fully repair this system.
     */
    async repair(): Promise<void> {}

    /**
     * Sabotage this system.
     */
    async sabotage() {
        if (!this.room.myPlayer?.control)
            return;

        if (this.ship.canBeManaged()) {
            await this.ship.systems.get(SystemType.Sabotage)
                ?.HandleRepair(this.room.myPlayer, this.systemType, undefined);
        } else {
            await this.room.broadcast([
                new RpcMessage(
                    this.ship.netId,
                    new RepairSystemMessage(
                        SystemType.Sabotage,
                        this.room.myPlayer.control.netId,
                        this.systemType
                    )
                )
            ], undefined, [ this.room.hostId ]);
        }
    }

    protected async _sendRepair(amount: number) {
        if (!this.room.myPlayer?.control)
            return;

        await this.room.broadcast([
            new RpcMessage(
                this.ship.netId,
                new RepairSystemMessage(
                    this.systemType,
                    this.room.myPlayer.control.netId,
                    amount
                )
            )
        ], undefined, [ this.room.hostId ]);
    }
}
