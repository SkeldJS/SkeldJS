import { PlayerEvent } from "./PlayerEvent";

export class PlayerJoinEvent extends PlayerEvent {
    static eventName = "player.join" as const;
    eventName = "player.join" as const;
}
