import { DeconSystem } from "../../systems";

export interface DeconEvent {
    /**
     * The system that this event came from.
     */
    deconsystem: DeconSystem;
}
