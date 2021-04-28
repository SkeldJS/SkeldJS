import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player joins the room.
 *
 * Note that this doesn't necessarily mean that the player has spawned, see {@link PlayerSpawnEvent} to listen for that.
 */
export class PlayerJoinEvent extends PlayerEvent {
    static eventName = "player.join" as const;
    eventName = "player.join" as const;
}
