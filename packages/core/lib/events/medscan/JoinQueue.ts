import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { MedScanSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { MedScanEvent } from "./MedScanEvent";

/**
 * Emitted when a player joins the queue for a med scan.
 */
export class MedScanJoinQueueEvent<RoomType extends StatefulRoom> extends RevertableEvent implements MedScanEvent<RoomType>, ProtocolEvent {
    static eventName = "medscan.joinqueue" as const;
    eventName = "medscan.joinqueue" as const;

    private _alteredPlayer: Player<RoomType>;

    constructor(
        public readonly room: RoomType,
        public readonly medscan: MedScanSystem<RoomType>,
        public readonly message: RepairSystemMessage | undefined,
        /**
         * The player that joined the queue.
         */
        public readonly player: Player<RoomType>
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
    setPlayer(player: Player<RoomType>) {
        this._alteredPlayer = player;
    }
}
