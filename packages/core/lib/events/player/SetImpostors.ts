import { BasicEvent } from "@skeldjs/events";
import { SetInfectedMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerSetImpostorsEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.setimpostors" as const;
    eventName = "player.setimpostors" as const;

    private _alteredImpostors: PlayerData[];
    private _isDirty: boolean;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: SetInfectedMessage|undefined,
        public readonly impostors: PlayerData[]
    ) {
        super();

        this._alteredImpostors = [...impostors];
        this._isDirty = false;
    }

    get alteredImpostors() {
        return this._alteredImpostors;
    }

    get isDirty() {
        return this._isDirty;
    }
    setImpostors(impostors: PlayerData[]) {
        this._alteredImpostors = impostors;
        this._isDirty = true;
    }
}
