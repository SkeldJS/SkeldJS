import { ReactorSystem } from "../../systems";

export interface ReactorEvent {
    /**
     * The reactor system that this event is for.
     */
    reactor: ReactorSystem;
}
