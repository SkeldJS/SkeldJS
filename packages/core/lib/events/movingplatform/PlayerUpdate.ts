import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { RoomEvent } from "../RoomEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { MovingPlatformSide, MovingPlatformSystem } from "../../system";
import { ProtocolEvent } from "../ProtocolEvent";
import { MovingPlatformEvent } from "./MovingPlatformEvent";

export class MovingPlatformPlayerUpdateEvent extends RevertableEvent implements RoomEvent, MovingPlatformEvent, ProtocolEvent {
    private _alteredPlayer: PlayerData|undefined;
    private _alteredSide: MovingPlatformSide

    constructor(
        public readonly room: Hostable,
        public readonly movingplatform: MovingPlatformSystem,
        public readonly message: RepairSystemMessage|undefined,
        public readonly player: PlayerData|undefined,
        public readonly side: MovingPlatformSide
    ) {
        super();

        this._alteredPlayer = player;
        this._alteredSide = side;
    }

    get alteredPlayer() {
        return this._alteredPlayer;
    }

    get alteredSide() {
        return this._alteredSide;
    }

    setPlayer(player: PlayerData|undefined) {
        this._alteredPlayer = player;
    }

    setSide(side: MovingPlatformSide) {
        this._alteredSide = side;
    }
}
