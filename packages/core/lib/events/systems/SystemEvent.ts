import { AnySystem } from "../../systems/events";

export interface SystemEvent {
    /**
     * The system that this event is for.
     */
    system: AnySystem;
}
