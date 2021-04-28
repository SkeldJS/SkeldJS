import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player fully spawns.
 */
export class PlayerSpawnEvent extends PlayerEvent {
    static eventName = "player.spawn" as const;
    eventName = "player.spawn" as const;
}
