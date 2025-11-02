import { CancelableEvent } from "@skeldjs/events";
import { UsePlatformMessage } from "@skeldjs/au-protocol";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player uses a moving platform. Emitted before the player has
 * actually used it, see {@link MovingPlatformPlayerUpdateEvent} to listen for
 * when a player has actually used a moving platform and is moving.
 */
export class PlayerUseMovingPlatformEvent<RoomType extends StatefulRoom> extends CancelableEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.usemovingplatform" as const;
    eventName = "player.usemovingplatform" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: UsePlatformMessage | undefined
    ) {
        super();
    }
}
