import { MovingPlatformSystem } from "../../systems";

export interface MovingPlatformEvent {
    /**
     * The moving platform system that this event is for.
     */
    movingplatform: MovingPlatformSystem;
}
