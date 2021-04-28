import { BasicEvent } from "@skeldjs/events";

/**
 * Emitted when the pathfinder reaches its destination.
 */
export class PathfinderEndEvent extends BasicEvent {
    static eventName = "pathfinding.end" as const;
    eventName = "pathfinding.end" as const;
}
