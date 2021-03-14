import { HazelBuffer } from "@skeldjs/util";

import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { BaseSystemStatusEvents } from "./events";

export interface HudOverrideSystemData {
    sabotaged: boolean;
}

export interface HudOverrideSystemEvents extends BaseSystemStatusEvents {}


/**
 * Represents a system responsible for handling communication sabotages on The Skeld and Polus.
 *
 * See {@link HudOverrideSystemEvents} for events to listen to.
 */
export class HudOverrideSystem extends SystemStatus<HudOverrideSystemData, HudOverrideSystemEvents> {
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
        ship: BaseShipStatus,
        data?: HazelBuffer | HudOverrideSystemData
    ) {
        super(ship, data);
    }

    patch(data: HudOverrideSystemData) {
        this._sabotaged = data.sabotaged;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        const before = this.sabotaged;
        this._sabotaged = reader.bool();

        if (!before && this._sabotaged) this.emit("system.sabotage", {});
        if (before && !this._sabotaged) this.emit("system.repair", {});
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.bool(this.sabotaged);
    }

    fix() {
        this.HandleRepair(this.ship.room.me, 0);
    }

    HandleSabotage() {
        this.emit("system.sabotage", {});
        this._sabotaged = true;
        this.dirty = true;
    }

    HandleRepair(player: PlayerData, amount: number) {
        if (amount === 0) {
            this.emit("system.repair", {});
            this._sabotaged = false;
            this.dirty = true;
        }
    }
}
