import { SwitchSystem } from "../../systems";

export interface ElectricalEvent {
    /**
     * The electrical system that the event is for.
     */
    switchsystem: SwitchSystem;
}
