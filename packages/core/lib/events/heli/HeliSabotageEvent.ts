import { HeliSabotageSystem } from "../../systems";

export interface HeliSabotageEvent {
    /**
     * The heli sabotage system that this event is for.
     */
    helisabotagesystem: HeliSabotageSystem;
}
