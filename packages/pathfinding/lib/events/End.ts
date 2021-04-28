import { BasicEvent } from "@skeldjs/events";

export class PathfinderEndEvent extends BasicEvent {
    static eventName = "pathfinding.end" as const;
    eventName = "pathfinding.end" as const;
}
