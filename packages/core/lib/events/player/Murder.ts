import { BasicEvent } from "@skeldjs/events";
import { MurderPlayerMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerMurderEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.murder" as const;
    eventName = "player.murder" as const;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: MurderPlayerMessage|undefined,
        public readonly victim: PlayerData
    ) {
        super();
    }
}
