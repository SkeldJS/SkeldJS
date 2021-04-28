import { PlayerEvent } from "./PlayerEvent";

export class PlayerLeaveEvent extends PlayerEvent {
    static eventName = "player.leave" as const;
    eventName = "player.leave" as const;
}
