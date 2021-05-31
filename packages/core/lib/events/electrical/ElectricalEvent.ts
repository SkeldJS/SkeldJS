import { SwitchSystem } from "../../system";

export interface ElectricalEvent {
    /**
     * The electrical system that the event is for.
     */
    switchsystem: SwitchSystem;
}
