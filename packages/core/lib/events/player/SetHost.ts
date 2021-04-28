import { PlayerEvent } from "./PlayerEvent";

export class PlayerSetHostEvent extends PlayerEvent {
    static eventName = "player.sethost" as const;
    eventName = "player.sethost" as const;
}
