import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { DeconSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { DeconEvent } from "./DeconEvent";

export class DeconExitEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, DeconEvent, ProtocolEvent {
    static eventName = "decon.exit" as const;
    eventName = "decon.exit" as const;

    constructor(
        public readonly room: RoomType,
        public readonly deconsystem: DeconSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that opened the decontanimation doors and is exiting. Only
         * available if the client is the host.
         */
        public readonly player: PlayerData<RoomType>|undefined,
        /**
         * Whether or not the player is exiting to go to a cleanroom (such as the
         * reactor on Mira HQ).
         */
        public readonly headingUp: boolean
    ) {
        super();
    }
}
