import { HazelReader, HazelWriter } from "@skeldjs/util";
import { RpcMessageTag, SystemType } from "@skeldjs/constant";

import { EventEmitter } from "@skeldjs/events";
import { RepairSystemMessage, RpcMessage } from "@skeldjs/protocol";

import { InnerShipStatus } from "../component";
import { PlayerData } from "../PlayerData";

import { AnySystem, SystemStatusEvents } from "./events";
import { SystemSabotageEvent } from "../events";

export class SystemStatus<
    DataT = any,
    T extends SystemStatusEvents = SystemStatusEvents
> extends EventEmitter<T> {
    static systemType: SystemType;
    systemType: SystemType;

    constructor(protected ship: InnerShipStatus, data?: HazelReader | DataT) {
        super();

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

    /**
     * Whether or not this system is dirty.
     */
    get dirty() {
        return (this.ship.dirtyBit & (1 << this.systemType)) > 0;
    }

    set dirty(val: boolean) {
        if (val) {
            this.ship.dirtyBit |= 1 << this.systemType;
        } else {
            this.ship.dirtyBit &= ~(1 << this.systemType);
        }
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

    async emit<Event extends SystemStatusEvents[keyof SystemStatusEvents]>(
        event: Event
    ): Promise<Event>;
    async emit<Event extends T[keyof T]>(event: Event): Promise<Event>;
    async emit<Event extends T[keyof T]>(event: Event): Promise<Event> {
        if (this.ship) {
            this.ship.emit(event as any);
        }

        return super.emit(event);
    }

    /* eslint-disable-next-line */
    Deserialize(reader: HazelReader, spawn: boolean) {}
    /* eslint-disable-next-line */
    Serialize(writer: HazelWriter, spawn: boolean) {}
    /* eslint-disable-next-line */
    HandleRepair(player: PlayerData, amount: number) {}
    /* eslint-disable-next-line */
    Detoriorate(delta: number) {}
    /* eslint-disable-next-line */
    HandleSabotage(player: PlayerData) {}

    sabotage(player: PlayerData) {
        if (this.ship.room.amhost) {
            this.HandleSabotage(player);
            this.emit(
                new SystemSabotageEvent(
                    this.ship?.room,
                    (this as unknown) as AnySystem,
                    player
                )
            );
        } else {
            this.ship.room.broadcast(
                [
                    new RpcMessage(
                        this.ship.netid,
                        RpcMessageTag.RepairSystem,
                        new RepairSystemMessage(
                            SystemType.Sabotage,
                            player.control.netid,
                            this.systemType
                        )
                    ),
                ],
                true,
                this.ship.room.host
            );
        }
    }

    repair(player: PlayerData, amount: number) {
        if (this.ship.room.amhost) {
            this.HandleRepair(player, amount);
        } else {
            const writer = HazelWriter.alloc(3);
            writer.uint8(this.systemType);
            writer.upacked(player.control.netid);
            writer.uint8(amount);

            this.ship.room.broadcast(
                [
                    new RpcMessage(
                        this.ship.netid,
                        RpcMessageTag.RepairSystem,
                        new RepairSystemMessage(
                            SystemType.Sabotage,
                            player.control.netid,
                            this.systemType
                        )
                    ),
                ],
                true,
                this.ship.room.host
            );
        }
    }

    /* eslint-disable-next-line */
    fix() {}
}
