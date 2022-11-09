import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";

import { SystemRepairEvent, SystemSabotageEvent } from "../events";
import { SystemStatusEvents } from "./events";
import { Hostable } from "../Hostable";

export interface HudOverrideSystemData {
    sabotaged: boolean;
}

export type HudOverrideSystemEvents<RoomType extends Hostable = Hostable> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling communication sabotages on The Skeld and Polus.
 *
 * See {@link HudOverrideSystemEvents} for events to listen to.
 */
export class HudOverrideSystem<RoomType extends Hostable = Hostable> extends SystemStatus<
    HudOverrideSystemData,
    HudOverrideSystemEvents,
    RoomType
> implements HudOverrideSystemData {
    private _sabotaged: boolean;

    /**
     * Whether or not communications is sabotaged.
     */
    get sabotaged() {
        return this._sabotaged;
    }

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | HudOverrideSystemData
    ) {
        super(ship, systemType, data);

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
            this.emit(
                new SystemSabotageEvent(
                    this.room,
                    this,
                    undefined,
                    undefined
                )
            ).then(ev => {
                if (ev.reverted) {
                    this.repair();
                }
            });
        if (before && !this._sabotaged)
            this.emit(
                new SystemRepairEvent(
                    this.room,
                    this,
                    undefined,
                    undefined
                )
            ).then(ev => {
                if (ev.reverted) {
                    this.sabotage();
                }
            });
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.bool(this.sabotaged);
    }

    async HandleSabotage(player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        this._sabotaged = true;
        this.dirty = true;

        const ev = await this.emit(
            new SystemSabotageEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this._sabotaged = false;
        }
    }

    private async _repair(player: PlayerData|undefined, rpc: RepairSystemMessage|undefined) {
        this._sabotaged = false;
        this.dirty = true;

        const ev = await this.emit(
            new SystemRepairEvent(
                this.room,
                this,
                rpc,
                player
            )
        );

        if (ev.reverted) {
            this._sabotaged = true;
        }
    }

    async repair() {
        if (this.ship.canBeManaged()) {
            await this._repair(this.room.myPlayer, undefined);
        } else {
            await this._sendRepair(0);
        }
    }

    async HandleRepair(player: PlayerData<RoomType>|undefined, amount: number, rpc: RepairSystemMessage|undefined) {
        if (amount === 0) {
            await this._repair(player, rpc);
        }
    }
}
