import { PlayerEvent } from "./PlayerEvent";

export class PlayerReadyEvent extends PlayerEvent {
    static eventName = "player.ready" as const;
    eventName = "player.ready" as const;
}
