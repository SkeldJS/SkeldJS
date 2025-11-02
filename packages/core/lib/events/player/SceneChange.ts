import { CancelableEvent } from "@skeldjs/events";
import { SceneChangeMessage } from "@skeldjs/au-protocol";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player changes their scene, i.e. when they first join and
 * before they spawn into the game.
 *
 * A player does not necessarily have to change their scene, and they will
 * simply not spawn while recieving all game packets and events.
 */
export class PlayerSceneChangeEvent<RoomType extends StatefulRoom> extends CancelableEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventNamee = "player.scenechange" as const;
    eventName = "player.scenechange" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: SceneChangeMessage
    ) {
        super();
    }
}
