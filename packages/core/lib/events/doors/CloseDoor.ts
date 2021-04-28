import { DoorEvent } from "./DoorEvent";

/**
 * Emitted when a door on a map is closed.
 */
export class DoorCloseDoorEvent extends DoorEvent {
    static eventName = "doors.close" as const;
    eventName = "doors.close" as const;
}
