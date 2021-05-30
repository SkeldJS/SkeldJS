import { CancelableEvent } from "@skeldjs/events";
import { CheckNameMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerCheckNameEvent extends CancelableEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.checkname" as const;
    eventName = "player.checkname" as const;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: CheckNameMessage|undefined,
        public readonly originalName: string,
        public alteredName: string
    ) {
        super();
    }

    setName(name: string) {
        this.alteredName = name;
    }
}
