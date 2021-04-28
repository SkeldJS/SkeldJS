import { DoorEvent } from "./DoorEvent";

/**
 * Emitted when a door on a map is opened.
 */
export class DoorOpenDoorEvent extends DoorEvent {
    static eventName = "doors.open" as const;
    eventName = "doors.open" as const;
}
