import { PlayerEvent } from "./PlayerEvent";

export class PlayerSceneChangeEvent extends PlayerEvent {
    static eventName = "player.scenechange" as const;
    eventName = "player.scenechange" as const;
}
