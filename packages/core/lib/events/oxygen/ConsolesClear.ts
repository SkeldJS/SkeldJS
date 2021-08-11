import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { LifeSuppSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { O2Event } from "./O2Event";

/**
 * Emitted when the complete oxygen consoles are cleared, i.e. when a player fixes o2.
 */
export class O2ConsolesClearEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, O2Event, ProtocolEvent {
    static eventName = "o2.consoles.clear" as const;
    eventName = "o2.consoles.clear" as const;

    constructor(
        public readonly room: RoomType,
        public readonly oxygen: LifeSuppSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that cleared the consoles, i.e. the player that fixed o2.
         * Only available if the player is the host.
         */
        public readonly player: PlayerData<RoomType>|undefined
    ) {
        super();
    }
}
