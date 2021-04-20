import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { BaseSystemStatusEvents } from "./events";

export interface SabotageSystemData {
    cooldown: number;
}

export interface SabotageSystemEvents extends BaseSystemStatusEvents {}

/**
 * Represents a system responsible for handling system sabotages.
 *
 * See {@link SabotageSystemEvents} for events to listen to.
 */
export class SabotageSystem extends SystemStatus<
    SabotageSystemData,
    SabotageSystemEvents
> {
    static systemType = SystemType.Sabotage as const;
    systemType = SystemType.Sabotage as const;

    /**
     * The cooldown before another sabotage can happen.
     */
    cooldown: number;

    constructor(
        ship: InnerShipStatus,
        data?: HazelReader | SabotageSystemData
    ) {
        super(ship, data);
    }

    get anySabotaged() {
        return Object.values(this.ship.systems).some(
            (system) => system.sabotaged
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

    HandleRepair(player: PlayerData, amount: number) {
        const system = this.ship.systems[amount] as SystemStatus;

        if (system) {
            system.sabotage(player);

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
