import { BasicEvent } from "@skeldjs/events";
import { ExitVentMessage } from "@skeldjs/protocol";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player leaves a vent.
 */
export class PlayerExitVentEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.exitvent" as const;
    eventName = "player.exitvent" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: ExitVentMessage|undefined,
        /**
         * The ID of the vent that the player left.
         */
        public readonly ventid: number
    ) {
        super();
    }
}
