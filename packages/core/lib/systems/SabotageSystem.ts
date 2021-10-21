import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import { SystemStatusEvents } from "./events";
import { Hostable } from "../Hostable";

export interface SabotageSystemData {
    cooldown: number;
}

export type SabotageSystemEvents<RoomType extends Hostable = Hostable> = SystemStatusEvents<RoomType> & ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling system sabotages.
 *
 * See {@link SabotageSystemEvents} for events to listen to.
 */
export class SabotageSystem<RoomType extends Hostable = Hostable> extends SystemStatus<
    SabotageSystemData,
    SabotageSystemEvents,
    RoomType
> implements SabotageSystemData {
    /**
     * The cooldown before another sabotage can happen.
     */
    cooldown: number;

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | SabotageSystemData
    ) {
        super(ship, systemType, data);

        this.cooldown ??= 10000;
    }

    /**
     * Check whether any systems are currently sabotaged.
     */
    get anySabotaged() {
        return Object.values(this.ship.systems).some(
            system => system?.sabotaged
        );
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        this.cooldown = reader.float();
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.float(this.cooldown);
    }

    async HandleRepair(player: PlayerData<RoomType>|undefined, amount: number, rpc: RepairSystemMessage|undefined) {
        const system = this.ship.systems.get(amount) as SystemStatus;

        if (system) {
            await system.HandleSabotage(player, rpc);

            this.cooldown = 30;
            this.dirty = true;
        }
    }

    Detoriorate(delta: number) {
        if (this.cooldown > 0 && !this.anySabotaged) {
            this.cooldown -= delta;
            if (this.cooldown <= 0) {
                this.dirty = true;
            }
        }
    }
}
