import { AnySystem } from "../../system/events";

export interface SystemEvent {
    /**
     * The system that this event is for.
     */
    system: AnySystem;
}
