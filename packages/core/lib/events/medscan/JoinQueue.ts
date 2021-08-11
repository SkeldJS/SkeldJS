import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { MedScanSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { MedScanEvent } from "./MedScanEvent";

/**
 * Emitted when a player joins the queue for a med scan.
 */
export class MedScanJoinQueueEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, MedScanEvent, ProtocolEvent {
    static eventName = "medscan.joinqueue" as const;
    eventName = "medscan.joinqueue" as const;

    private _alteredPlayer: PlayerData<RoomType>;

    constructor(
        public readonly room: RoomType,
        public readonly medscan: MedScanSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that joined the queue.
         */
        public readonly player: PlayerData<RoomType>
    ) {
        super();

        this._alteredPlayer = player;
    }

    /**
     * The alternate player that will join the queue instead, if changed.
     */
    get alteredPlayer() {
        return this._alteredPlayer;
    }

    /**
     * Change the player that joined the queue.
     * @param player The player to join the queue.
     */
    setPlayer(player: PlayerData<RoomType>) {
        this._alteredPlayer = player;
    }
}
