import { BasicEvent } from "@skeldjs/events";

export class PathfinderPauseEvent extends BasicEvent {
    static eventName = "pathfinding.pause" as const;
    eventName = "pathfinding.pause" as const;
}
