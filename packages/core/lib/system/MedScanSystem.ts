import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { ExtractEventTypes } from "@skeldjs/events";
import { SystemStatusEvents } from "./events";

export interface MedScanSystemData {
    queue: PlayerData[];
}

export type MedScanSystemEvents = SystemStatusEvents & ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling the medbay scan queue.
 *
 * See {@link MedScanSystemEvents} for events to listen to.
 */
export class MedScanSystem extends SystemStatus<
    MedScanSystemData,
    MedScanSystemEvents
> implements MedScanSystemData {
    static systemType = SystemType.MedBay as const;
    systemType = SystemType.MedBay as const;

    /**
     * The current queue to access the medbay scan.s
     */
    queue: PlayerData[];

    constructor(ship: InnerShipStatus, data?: HazelReader | MedScanSystemData) {
        super(ship, data);

        this.queue ||= [];
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
        const num_players = reader.upacked();

        this.queue = [];
        for (let i = 0; i < num_players; i++) {
            const player = this.ship.room.getPlayerByPlayerId(reader.uint8());
            if (player) this.queue.push(player);
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.upacked(this.queue.length);

        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].playerId) writer.uint8(this.queue[i].playerId!);
        }
    }

    HandleRepair(player: PlayerData, amount: number) {
        const playerId = amount & 0x1f;
        const resolved = this.ship.room.getPlayerByPlayerId(playerId);

        if (resolved) {
            if (amount & 0x80) {
                this.queue.push(resolved);
            } else if (amount & 0x40) {
                const idx = this.queue.indexOf(resolved);

                if (~idx) {
                    this.queue.splice(idx, 1);
                }
            }
        }
    }
}
