import { ReactorSystem } from "../../system";

export interface ReactorEvent {
    /**
     * The reactor system that this event is for.
     */
    reactor: ReactorSystem;
}
