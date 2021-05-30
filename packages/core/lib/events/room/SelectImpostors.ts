import { CancelableEvent } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { RoomEvent } from "../RoomEvent";

export class RoomSelectImpostorsEvent extends CancelableEvent implements RoomEvent {
    static eventName = "room.selectimpostors" as const;
    eventName = "room.selectimpostors" as const;

    private _alteredImpostors: PlayerData[];

    constructor(
        public readonly room: Hostable,
        public readonly impostors: PlayerData[]
    ) {
        super();

        this._alteredImpostors = impostors;
    }

    get alteredImpostors() {
        return this._alteredImpostors;
    }

    setImpostors(impostors: PlayerData[]) {
        this._alteredImpostors = impostors;
    }
}
