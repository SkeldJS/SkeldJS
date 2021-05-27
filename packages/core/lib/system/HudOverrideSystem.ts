import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { SystemRepairEvent, SystemSabotageEvent } from "../events";
import { ExtractEventTypes } from "@skeldjs/events";
import { SystemStatusEvents } from "./events";

export interface HudOverrideSystemData {
    sabotaged: boolean;
}

export type HudOverrideSystemEvents = SystemStatusEvents &
    ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling communication sabotages on The Skeld and Polus.
 *
 * See {@link HudOverrideSystemEvents} for events to listen to.
 */
export class HudOverrideSystem extends SystemStatus<
    HudOverrideSystemData,
    HudOverrideSystemEvents
> implements HudOverrideSystemData {
    static systemType = SystemType.Communications as const;
    systemType = SystemType.Communications as const;

    private _sabotaged: boolean;

    /**
     * Whether or not communications is sabotaged.
     */
    get sabotaged() {
        return this._sabotaged;
    }

    constructor(
        ship: InnerShipStatus,
        data?: HazelReader | HudOverrideSystemData
    ) {
        super(ship, data);

        this._sabotaged = false;
    }

    patch(data: HudOverrideSystemData) {
        this._sabotaged = data.sabotaged;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const before = this.sabotaged;
        this._sabotaged = reader.bool();

        if (!before && this._sabotaged)
            this.emit(new SystemSabotageEvent(this.ship?.room, this));
        if (before && !this._sabotaged)
            this.emit(new SystemRepairEvent(this.ship?.room, this));
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.bool(this.sabotaged);
    }

    fix() {
        if (!this.ship.room.me)
            return;

        this.HandleRepair(this.ship.room.me, 0);
    }

    HandleSabotage() {
        this.emit(new SystemSabotageEvent(this.ship?.room, this));
        this._sabotaged = true;
        this.dirty = true;
    }

    HandleRepair(player: PlayerData, amount: number) {
        if (amount === 0) {
            this.emit(new SystemRepairEvent(this.ship?.room, this));
            this._sabotaged = false;
            this.dirty = true;
        }
    }
}
