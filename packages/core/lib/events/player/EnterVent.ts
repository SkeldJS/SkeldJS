import { BasicEvent } from "@skeldjs/events";
import { EnterVentMessage } from "@skeldjs/protocol";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerEnterVentEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.entervent" as const;
    eventName = "player.entervent" as const;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: EnterVentMessage|undefined,
        public readonly ventid: number
    ) {
        super();
    }
}
