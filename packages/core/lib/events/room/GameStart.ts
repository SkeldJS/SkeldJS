import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when a game in the room starts.
 */
export class RoomGameStartEvent extends RoomEvent {
    static eventName = "room.game.start" as const;
    eventName = "room.game.start" as const;
}
