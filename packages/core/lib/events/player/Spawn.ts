import { PlayerEvent } from "./PlayerEvent";

export class PlayerSpawnEvent extends PlayerEvent {
    static eventName = "player.spawn" as const;
    eventName = "player.spawn" as const;
}
