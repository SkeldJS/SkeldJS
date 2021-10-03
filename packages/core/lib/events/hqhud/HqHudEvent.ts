import { HqHudSystem } from "../../systems/HqHudSystem";

export interface HqHudEvent {
    /**
     * The Mira HQ communications system that this event is for.
     */
    hqhudsystem: HqHudSystem;
}
