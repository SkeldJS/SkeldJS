import { LifeSuppSystem } from "../../systems/LifeSuppSystem";

export interface O2Event {
    /**
     * The oxygen system that this event is for.
     */
    oxygen: LifeSuppSystem;
}
