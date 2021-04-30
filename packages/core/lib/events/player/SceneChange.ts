import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player requests to change their scene.
 */
export class PlayerSceneChangeEvent extends PlayerEvent {
    static eventName = "player.scenechange" as const;
    eventName = "player.scenechange" as const;
}
