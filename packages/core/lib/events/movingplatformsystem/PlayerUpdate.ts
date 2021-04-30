import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { MovingPlatformSide, MovingPlatformSystem } from "../../system";
import { MovingPlatformSystemEvent } from "./MovingPlatformSystemEvent";

/**
 * Emitted when the moving platform on the map moves due to the player on it being updated.
 */
export class MovingPlatformPlayerUpdateEvent extends MovingPlatformSystemEvent {
    static eventName = "movingplatform.player.update" as const;
    eventName = "movingplatform.player.update" as const;

    /**
     * The player on the moving platform.
     */
    player: PlayerData;

    /**
     * The direction that the moving platform is moving in.
     */
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
