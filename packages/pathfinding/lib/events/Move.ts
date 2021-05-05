import { CancelableEvent } from "@skeldjs/events";
import { Vector2 } from "@skeldjs/util";

/**
 * Emitted before the pathfinder makes a move.
 */
export class EngineMoveEvent extends CancelableEvent {
    static eventName = "engine.move" as const;
    eventName = "engine.move" as const;

    /**
     * The position that the pathfinder will move to.
     */
    position: Vector2;

    constructor(position: Vector2) {
        super();

        this.position = position;
    }
}
