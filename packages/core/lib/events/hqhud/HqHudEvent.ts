import { HqHudSystem } from "../../system/HqHudSystem";

export interface HqHudEvent {
    /**
     * The Mira HQ communications system that this event is for.
     */
    hqhud: HqHudSystem;
}
