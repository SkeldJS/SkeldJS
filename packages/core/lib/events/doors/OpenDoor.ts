import { DoorEvent } from "./DoorEvent";

export class DoorOpenDoorEvent extends DoorEvent {
    static eventName = "doors.open" as const;
    eventName = "doors.open" as const;
}
