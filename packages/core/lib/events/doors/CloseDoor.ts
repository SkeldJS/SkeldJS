import { DoorEvent } from "./DoorEvent";

export class DoorCloseDoorEvent extends DoorEvent {
    static eventName = "doors.close" as const;
    eventName = "doors.close" as const;
}
