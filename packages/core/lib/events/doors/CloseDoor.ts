import { DoorEvent } from "./DoorEvent";

/**
 * Emitted when a door on a map is closed.
 *
 * @example
 * ```typescript
 * // Print whenever a door on the map is closed.
 * client.on("doors.close", async ev => {
 *   console.log("A player closed door with ID " + ev.door.id)
 * });
 * ```
 */
export class DoorCloseDoorEvent extends DoorEvent {
    static eventName = "doors.close" as const;
    eventName = "doors.close" as const;
}
