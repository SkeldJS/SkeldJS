import { BasicEvent } from "@skeldjs/events";
import { Vector2 } from "@skeldjs/util";

export class PathfinderStartEvent extends BasicEvent {
    static eventName = "pathfinding.start" as const;
    eventName = "pathfinding.start" as const;

    destination: Vector2;

    constructor(
        destination: Vector2
    ) {
        super();

        this.destination = destination;
    }
}
