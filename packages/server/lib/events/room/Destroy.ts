import { RoomEvent } from "./RoomEvent";

/**
 * Emitted when a room is destroyed.
 */
export class RoomDestroyEvent extends RoomEvent {
    static eventName = "room.destroy" as const;
    eventName = "room.destroy" as const;
}
