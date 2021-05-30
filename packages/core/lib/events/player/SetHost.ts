import { BasicEvent } from "@skeldjs/events";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerSetHostEvent extends BasicEvent implements RoomEvent, PlayerEvent {
    static eventName = "player.sethost" as const;
    eventName = "player.sethost" as const;

    private _alteredHost: PlayerData;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData
    ) {
        super();

        this._alteredHost = player;
    }

    get alteredHost() {
        return this._alteredHost;
    }

    setHost(player: PlayerData) {
        this._alteredHost = player;
    }
}
