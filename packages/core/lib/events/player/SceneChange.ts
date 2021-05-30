import { CancelableEvent } from "@skeldjs/events";
import { SceneChangeMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerSceneChangeEvent extends CancelableEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventNamee = "player.scenechange" as const;
    eventName = "player.scenechange" as const;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: SceneChangeMessage
    ) {
        super();
    }
}
