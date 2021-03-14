import { HazelBuffer } from "@skeldjs/util";

import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { BaseSystemStatusEvents } from "./events";

export interface ReactorSystemData {
    timer: number;
    completed: Set<number>;
}

export interface ReactorSystemEvents extends BaseSystemStatusEvents {}

/**
 * Represents a system responsible for handling reactor consoles.
 *
 * See {@link ReactorSystemEvents} for events to listen to.
 */

export class ReactorSystem extends SystemStatus<ReactorSystemData, ReactorSystemEvents> {
    static systemType = SystemType.Reactor as const;
    systemType = SystemType.Reactor as const;

    /**
     * The timer before the reactor explodes.
     */
    timer: number;

    /**
     * The completed consoles.
     */
    completed: Set<number>;

    constructor(ship: BaseShipStatus, data?: HazelBuffer | ReactorSystemData) {
        super(ship, data);
    }

    get sabotaged() {
        return this.timer < 10000;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        this.timer = reader.float();

        const num_consoles = reader.upacked();
        this.completed.clear();
        for (let i = 0; i < num_consoles; i++) {
            this.completed.add(reader.upacked());
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.float(this.timer);
        const completed = [...this.completed];
        writer.upacked(completed.length);
        for (let i = 0; i < completed.length; i++) {
            writer.upacked(completed[i]);
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    HandleRepair(player: PlayerData, amount: number) {
        const consoleId = amount & 0x3;

        if (amount & 0x40) {
            this.completed.add(consoleId);
        } else if (amount & 0x20) {
            this.completed.delete(consoleId);
        } else if (amount & 0x1) {
            this.timer = 10000;
            this.completed.clear();
        }

        this.dirty = true;
    }

    private _lastUpdate = 0;
    Detoriorate(delta: number) {
        if (!this.sabotaged) return;

        this.timer -= delta;
        this._lastUpdate += delta;

        if (this._lastUpdate > 2) {
            this._lastUpdate = 0;
            this.dirty = true;
        }
    }
}
