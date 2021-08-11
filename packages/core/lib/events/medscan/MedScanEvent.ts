import { MedScanSystem } from "../../systems/MedScanSystem";

export interface MedScanEvent {
    /**
     * The med scan system that this event is for.
     */
    medscan: MedScanSystem;
}
