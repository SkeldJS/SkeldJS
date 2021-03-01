import { HazelBuffer } from "@skeldjs/util"

import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { BaseSystemStatusEvents } from "./events";

export interface HudOverrideSystemData {
    sabotaged: boolean;
}

export type HudOverrideSystemEvents = BaseSystemStatusEvents & {

}

export class HudOverrideSystem extends SystemStatus<HudOverrideSystemEvents> {
    static systemType = SystemType.Communications as const;
    systemType = SystemType.Communications as const;

    _sabotaged: boolean;

    get sabotaged() {
        return this._sabotaged;
    }

    constructor(ship: BaseShipStatus, data?: HazelBuffer|HudOverrideSystemData) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        const before = this.sabotaged;
        this._sabotaged = reader.bool();

        if (!before && this._sabotaged)
            this.emit("system.sabotage", {});

        if (before && !this._sabotaged)
            this.emit("system.repair", {});
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.bool(this.sabotaged);
    }

    HandleRepair(player: PlayerData, amount: number) {
        if (amount === 0) {
            this._sabotaged = false;
            this.dirty = true;
        }
    }
}
