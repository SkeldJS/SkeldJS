import { BasicEvent } from "@skeldjs/events";

export class PathfinderStopEvent extends BasicEvent {
    static eventName = "pathfinding.stop" as const;
    eventName = "pathfinding.stop" as const;

    reached: boolean;

    constructor(
        reached: boolean
    ) {
        super();

        this.reached = reached;
    }
}
