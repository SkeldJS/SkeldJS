import { CancelableEvent } from "@skeldjs/events";
import { UsePlatformMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player uses a moving platform. Emitted before the player has
 * actually used it, see {@link MovingPlatformPlayerUpdateEvent} to listen for
 * when a player has actually used a moving platform and is moving.
 */
export class PlayerUseMovingPlatformEvent<RoomType extends Hostable = Hostable> extends CancelableEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.usemovingplatform" as const;
    eventName = "player.usemovingplatform" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: UsePlatformMessage|undefined
    ) {
        super();
    }
}
