import { HazelBuffer } from "@skeldjs/util";

import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { BaseSystemStatusEvents } from "./events";

export const DeconState = {
    Enter: 0x1,
    Closed: 0x2,
    Exit: 0x4,
    HeadingUp: 0x8
};

export interface DeconSystemData {
    timer: number;
    state: number;
}

export interface DeconSystemEvents extends BaseSystemStatusEvents {}

/**
 * Represents a system responsible for the decontamination doors.
 *
 * See {@link DeconSystemEvents} for events to listen to.
 */
export class DeconSystem extends SystemStatus<DeconSystemData, DeconSystemEvents> {
    static systemType = SystemType.Decontamination as const;
    systemType = SystemType.Decontamination as const;

    /**
     * How long before decontamination doors open.
     */
    timer: number;

    /**
     * The state of the decontamination system, to be calculated with {@link DeconState}
     */
    state: number;

    constructor(ship: BaseShipStatus, data?: HazelBuffer | DeconSystemData) {
        super(ship, data);
    }

    Deserialize(reader: HazelBuffer, spawn: boolean) {
        if (!spawn) {
            this.timer = reader.byte();
            this.state = reader.byte();
        }
    }

    Serialize(writer: HazelBuffer, spawn: boolean) {
        if (!spawn) {
            writer.byte(this.timer);
            writer.byte(this.state);
        }
    }
}
