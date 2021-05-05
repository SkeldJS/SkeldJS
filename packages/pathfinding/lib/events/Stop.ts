import { BasicEvent } from "@skeldjs/events";

/**
 * Emitted when the pathfinder stops, either from pausing or from reaching its destination.
 */
export class PathfinderStopEvent extends BasicEvent {
    static eventName = "pathfinding.stop" as const;
    eventName = "pathfinding.stop" as const;

    /**
     * Whether or not the pathfinder reached its destination.
     */
    reached: boolean;

    constructor(reached: boolean) {
        super();

        this.reached = reached;
    }
}
