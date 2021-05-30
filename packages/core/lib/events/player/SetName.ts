import { BasicEvent } from "@skeldjs/events";
import { SetNameMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerSetNameEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setname" as const;
    eventName = "player.setname" as const;

    private _alteredName: string;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: SetNameMessage|undefined,
        public readonly oldName: string,
        public readonly newName: string
    ) {
        super();

        this._alteredName = newName;
    }

    get alteredName() {
        return this._alteredName;
    }

    revert() {
        this.setName(this.oldName);
    }

    setName(name: string) {
        this._alteredName = name;
    }
}
