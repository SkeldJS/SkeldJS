import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { MedScanSystem } from "../../system";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { MedScanEvent } from "./MedScanEvent";

/**
 * Emitted when a player leaves the queue for a med scan.
 */
export class MedScanLeaveQueueEvent extends RevertableEvent implements RoomEvent, MedScanEvent, ProtocolEvent {
    static eventName = "medscan.leavequeue" as const;
    eventName = "medscan.leavequeue" as const;

    private _alteredPlayer: PlayerData;

    constructor(
        public readonly room: Hostable,
        public readonly medscan: MedScanSystem,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that left the queue.
         */
        public readonly player: PlayerData
    ) {
        super();

        this._alteredPlayer = player;
    }

    /**
     * The alternate player that will leave the queue instead, if changed.
     */
    get alteredPlayer() {
        return this._alteredPlayer;
    }

    /**
     * Change the player that left the queue.
     * @param player The player that left the queue.
     */
    setPlayer(player: PlayerData) {
        this._alteredPlayer = player;
    }
}
