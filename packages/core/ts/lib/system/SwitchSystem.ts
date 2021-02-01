import { HazelBuffer } from "@skeldjs/util"
import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

type SwitchSetup = [ boolean, boolean, boolean, boolean, boolean ];

export interface SwitchSystemData {
    expected: SwitchSetup;
    actual: SwitchSetup;
    brightness: number;
}

export type SwitchSystemEvents = {

}

export class SwitchSystem extends SystemStatus<SwitchSystemEvents> {
    static systemType = SystemType.Electrical as const;
    systemType = SystemType.Electrical as const;

    expected: SwitchSetup;
    actual: SwitchSetup;
    brightness: number;

    constructor(ship: BaseShipStatus, data?: HazelBuffer|SwitchSystemData) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        this.expected = SwitchSystem.readSwitches(reader.byte());
        this.actual = SwitchSystem.readSwitches(reader.byte());
        this.brightness = reader.uint8();
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.byte(SwitchSystem.writeSwitches(this.expected));
        writer.byte(SwitchSystem.writeSwitches(this.actual));
        writer.uint8(this.brightness);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    HandleRepair(control: PlayerData, amount: number) {
        this.actual[amount] = !this.actual[amount];
    }

    static readSwitches(byte: number) {
        const vals: SwitchSetup = [false, false, false, false, false];

        vals[0] = !!(byte & 0x1);
        vals[1] = !!(byte & 0x2);
        vals[2] = !!(byte & 0x4);
        vals[3] = !!(byte & 0x8);
        vals[4] = !!(byte & 0x10);

        return vals;
    }

    static writeSwitches(switches: SwitchSetup) {
        return (~~switches[0]) |
            (~~switches[1] << 1) |
            (~~switches[2] << 2) |
            (~~switches[3] << 3) |
            (~~switches[4] << 4);
    }
}
