import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { RoomEvent } from "../RoomEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { SwitchSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { ElectricalEvent } from "./ElectricalEvent";

/**
 * Emitted when a player flips a switch while Electrical is sabotaged.
 */
export class ElectricalSwitchFlipEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, ElectricalEvent, ProtocolEvent {
    static eventName = "electrical.switchflip" as const;
    eventName = "electrical.switchflip" as const;

    private _alteredSwitchId: number;
    private _alteredFlipped: boolean;

    constructor(
        public readonly room: RoomType,
        public readonly switchsystem: SwitchSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that flipped the switch. Only available if the client is
         * the host.
         */
        public readonly player: PlayerData<RoomType>|undefined,
        /**
         * The ID of the switch that was flipped (from left-to-right, starting at 0).
         */
        public readonly switchId: number,
        /**
         * Whether this switch is flipped.
         */
        public readonly flipped: boolean
    ) {
        super();

        this._alteredSwitchId = switchId;
        this._alteredFlipped = flipped;
    }

    /**
     * The ID of the alternate switch to flip, if changed.
     */
    get alteredSwitchId() {
        return this._alteredSwitchId;
    }

    /**
     * The alternate value of the switch, if changed.
     */
    get alteredFlipped() {
        return this._alteredFlipped;
    }

    /**
     * Change the switch that was flipped.
     * @param switchId The ID of the switch to flip (from left-to-right, starting at 0).
     */
    setSwitchId(switchId: number) {
        this._alteredSwitchId = switchId;
    }

    /**
     * Set whether the switch is flipped.
     * @param flipped Whether the switch is flipped.
     */
    setFlipped(flipped: boolean) {
        this._alteredFlipped = flipped;
    }
}
