import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player leaves the room.
 */
export class PlayerLeaveEvent extends PlayerEvent {
    static eventName = "player.leave" as const;
    eventName = "player.leave" as const;
}
