import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player is made the host.
 */
export class PlayerSetHostEvent extends PlayerEvent {
    static eventName = "player.sethost" as const;
    eventName = "player.sethost" as const;
}
