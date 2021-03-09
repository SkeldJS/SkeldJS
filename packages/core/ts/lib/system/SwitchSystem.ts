import { HazelBuffer } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { BaseSystemStatusEvents } from "./events";

type SwitchSetup = [boolean, boolean, boolean, boolean, boolean];

export interface SwitchSystemData {
    expected: SwitchSetup;
    actual: SwitchSetup;
    brightness: number;
}

export type SwitchSystemEvents = BaseSystemStatusEvents & {
    "electrical.switches.flip": {
        player?: PlayerData;
        num: number;
        value: boolean;
    };
};

export class SwitchSystem extends SystemStatus<SwitchSystemData, SwitchSystemEvents> {
    static systemType = SystemType.Electrical as const;
    systemType = SystemType.Electrical as const;

    expected: SwitchSetup;
    actual: SwitchSetup;
    brightness: number;

    get sabotaged() {
        return this.expected.some((val, i) => this.actual[i] !== val);
    }

    constructor(ship: BaseShipStatus, data?: HazelBuffer | SwitchSystemData) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        const before = this.sabotaged;
        this.expected = SwitchSystem.readSwitches(reader.byte());
        this.actual = SwitchSystem.readSwitches(reader.byte());
        if (!before && this.sabotaged) {
            this.emit("system.sabotage", {});
        }
        if (before && !this.sabotaged) {
            this.emit("system.repair", {});
        }
        this.brightness = reader.uint8();
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.byte(SwitchSystem.writeSwitches(this.expected));
        writer.byte(SwitchSystem.writeSwitches(this.actual));
        writer.uint8(this.brightness);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    HandleRepair(player: PlayerData, amount: number) {
        this._setSwitch(amount, !this.actual[amount], player);
    }

    private _setSwitch(num: number, value: boolean, player?: PlayerData) {
        if (this.actual[num] === value) return;

        this.actual[num] = value;
        this.dirty = true;
        this.emit("electrical.switches.flip", { player, num, value });
    }

    setSwitch(num: number, value: boolean) {
        if (this.actual[num] === value) return;

        this.flip(num);
    }

    flip(num: number) {
        this.repair(this.ship.room.me, num);
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
        return (
            ~~switches[0] |
            (~~switches[1] << 1) |
            (~~switches[2] << 2) |
            (~~switches[3] << 3) |
            (~~switches[4] << 4)
        );
    }
}
