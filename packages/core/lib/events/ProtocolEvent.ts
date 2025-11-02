import { TaggedCloneable } from "@skeldjs/au-protocol";

export interface ProtocolEvent {
    /**
     * The message that this event originated from.
     */
    message: TaggedCloneable|undefined;
}
