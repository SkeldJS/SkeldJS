import { HazelReader, HazelWriter } from "@skeldjs/util";
import { RpcMessageTag, SystemType } from "@skeldjs/constant";

import { EventEmitter } from "@skeldjs/events";

import { InnerShipStatus } from "../component";
import { PlayerData } from "../PlayerData";

import { SystemStatusEvents } from "./events";
import { RpcMessage } from "@skeldjs/protocol";

export class SystemStatus<
    DataT = any,
    T extends Record<string, any> = {}
> extends EventEmitter<T & SystemStatusEvents> {
    static systemType: SystemType;
    systemType: SystemType;

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

    async emit(...args: any[]): Promise<boolean> {
        const event = args[0];
        const data = args[1];

        this.ship.emit(event, {
            ...data,
            system: this,
        });

        return super.emit(event, data);
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
            this.emit("system.sabotage", { player });
        } else {
            const writer = HazelWriter.alloc(3);
            writer.uint8(SystemType.Sabotage);
            writer.upacked(player.control.netid);
            writer.uint8(this.systemType);

            this.ship.room.broadcast(
                [
                    new RpcMessage(
                        this.ship.netid,
                        RpcMessageTag.RepairSystem,
                        writer.buffer
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
                        writer.buffer
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
