import { RoomEvent } from "../RoomEvent";

export class RoomGameStartEvent extends RoomEvent {
    static eventName = "room.game.start" as const;
    eventName = "room.game.start" as const;
}
