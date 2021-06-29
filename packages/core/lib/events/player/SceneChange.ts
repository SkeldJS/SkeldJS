import { CancelableEvent } from "@skeldjs/events";
import { SceneChangeMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player changes their scene, i.e. when they first join and
 * before they spawn into the game.
 *
 * A player does not necessarily have to change their scene, and they will
 * simply not spawn while recieving all game packets and events.
 */
export class PlayerSceneChangeEvent<RoomType extends Hostable = Hostable> extends CancelableEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventNamee = "player.scenechange" as const;
    eventName = "player.scenechange" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SceneChangeMessage
    ) {
        super();
    }
}
