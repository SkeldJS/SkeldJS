import { BasicEvent } from "@skeldjs/events";
import { CancelPetMessage } from "@skeldjs/protocol";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player stops petting their or another player's pet.
 */
export class PlayerCancelPetEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.cancelpet" as const;
    eventName = "player.cancelpet" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: CancelPetMessage|undefined
    ) {
        super();
    }
}
