import { MovingPlatformSystem } from "../../system";

export interface MovingPlatformEvent {
    /**
     * The moving platform system that this event is for.
     */
    movingplatform: MovingPlatformSystem;
}
