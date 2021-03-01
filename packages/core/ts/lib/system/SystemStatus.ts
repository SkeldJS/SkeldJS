import { HazelBuffer } from "@skeldjs/util"
import { MessageTag, RpcTag, SystemType } from "@skeldjs/constant";

import Emittery from "emittery";

import { BaseShipStatus } from "../component";
import { PlayerData } from "../PlayerData";

import { SystemStatusEvents } from "./events";

export class SystemStatus<T extends Record<string, any> = {}> extends Emittery<T & SystemStatusEvents> {
    static systemType: SystemType;
    systemType: SystemType;

    get dirty() {
        return (this.ship.dirtyBit & (1 << this.systemType)) > 0;
    }

    set dirty(val: boolean) {
        if (val) {
            this.ship.dirtyBit |= (1 << this.systemType);
        } else {
            this.ship.dirtyBit &= ~(1 << this.systemType);
        }
    }

    get sabotaged() {
        return false;
    }

    constructor(protected ship: BaseShipStatus, data?: HazelBuffer|any) {
        super();

        if (data) {
            if ((data as HazelBuffer).buffer) {
                this.Deserialize(data, true);
            } else {
                Object.assign(this, data);
            }
        }
    }

    async emit(...args: any[]) {
        const event = args[0];
        const data = args[1];

        this.ship.emit(event, {
            ...data,
            system: this
        });

        return super.emit(event, data);
    }

    /* eslint-disable-next-line */
    Deserialize(reader: HazelBuffer, spawn: boolean) {}
    /* eslint-disable-next-line */
    Serialize(writer: HazelBuffer, spawn: boolean) {}
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
            this.ship.room.broadcast([{
                tag: MessageTag.RPC,
                netid: this.ship.netid,
                rpcid: RpcTag.RepairSystem,
                systemid: SystemType.Sabotage,
                repairerid: player.control.netid,
                value: this.systemType
            }], true, this.ship.room.host);
        }
    }

    repair(player: PlayerData, amount: number) {
        if (this.ship.room.amhost) {
            this.HandleRepair(player, amount);
        } else {
            this.ship.room.broadcast([{
                tag: MessageTag.RPC,
                netid: this.ship.netid,
                rpcid: RpcTag.RepairSystem,
                systemid: this.systemType,
                repairerid: player.control.netid,
                value: amount
            }], true, this.ship.room.host);
        }
    }

    /* eslint-disable-next-line */
    fix() {};
}
