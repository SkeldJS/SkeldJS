import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { MovingPlatformSide, MovingPlatformSystem } from "../../system";
import { MovingPlatformSystemEvent } from "./MovingPlatformSystemEvent";

export class MovingPlatformPlayerUpdateEvent extends MovingPlatformSystemEvent {
    static eventName = "movingplatform.player.update" as const;
    eventName = "movingplatform.player.update" as const;

    player: PlayerData;
    side: MovingPlatformSide;

    constructor(
        room: Hostable<any>,
        system: MovingPlatformSystem,
        player: PlayerData,
        side: MovingPlatformSide
    ) {
        super(room, system);

        this.player = player;
        this.side = side;
    }
}
