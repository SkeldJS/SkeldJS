import { BasicEvent } from "@skeldjs/events";

/**
 * Emitted when the pathfinder is paused.
 */
export class PathfinderPauseEvent extends BasicEvent {
    static eventName = "pathfinding.pause" as const;
    eventName = "pathfinding.pause" as const;
}
