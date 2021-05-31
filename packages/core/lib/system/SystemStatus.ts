import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { BasicEvent, EventEmitter } from "@skeldjs/events";
import { RepairSystemMessage, RpcMessage } from "@skeldjs/protocol";

import { InnerShipStatus } from "../component";
import { PlayerData } from "../PlayerData";

import { SystemStatusEvents } from "./events";

export class SystemStatus<
    DataT = any,
    T extends SystemStatusEvents = SystemStatusEvents
> extends EventEmitter<T> {
    static systemType: SystemType;
    systemType!: SystemType;

    private _dirty: boolean;

    constructor(protected ship: InnerShipStatus, data?: HazelReader | DataT) {
        super();

        if (data) {
            if (data instanceof HazelReader) {
                this.Deserialize(data, true);
            } else {
                this.patch(data);
            }
        }

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

    Deserialize(reader: HazelReader, spawn: boolean): void {
        void reader, spawn;
    }

    Serialize(writer: HazelWriter, spawn: boolean): void {
        void writer, spawn;
    }

    async HandleRepair(player: PlayerData, amount: number, rpc: RepairSystemMessage|undefined|undefined): Promise<void> {
        void player, amount, rpc;
    }

    Detoriorate(delta: number): void {
        void delta;
    }

    async HandleSabotage(player: PlayerData, rpc: RepairSystemMessage|undefined): Promise<void> {
        void player, rpc;
    }

    async sabotage(): Promise<void> {}
    async repair(): Promise<void> {}

    protected async _repairSystem(amount: number) {
        if (!this.room.me?.control)
            return;

        if (this.room.amhost) {
            await this.HandleRepair(this.room.me, amount, undefined);
        } else {
            await this.room.broadcast([
                new RpcMessage(
                    this.ship.netid,
                    new RepairSystemMessage(
                        this.systemType,
                        this.room.me.control.netid,
                        amount
                    )
                )
            ], true, this.room.host, []);
        }
    }
}
