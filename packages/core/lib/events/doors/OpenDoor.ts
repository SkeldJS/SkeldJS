import { DoorEvent } from "./DoorEvent";

/**
 * Emitted when a door on a map is opened.
 *
 * @example
 * ```typescript
 * // Close a door whenever it opens.
 * client.on("doors.open", ev => {
 *   ev.door.close();
 * });
 * ```
 */
export class DoorOpenDoorEvent extends DoorEvent {
    static eventName = "doors.open" as const;
    eventName = "doors.open" as const;
}
