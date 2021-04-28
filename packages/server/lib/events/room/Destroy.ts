import { RoomEvent } from "./RoomEvent";

export class RoomDestroyEvent extends RoomEvent {
    static eventName = "room.destroy" as const;
    eventName = "room.destroy" as const;
}
