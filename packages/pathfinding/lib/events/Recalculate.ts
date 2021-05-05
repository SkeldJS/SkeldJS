import { BasicEvent } from "@skeldjs/events";
import { Vector2 } from "@skeldjs/util";

/**
 * Emitted when the pathfinder engine recalculates its path.
 */
export class EngineRecalculateEvent extends BasicEvent {
    static eventName = "engine.recalculate" as const;
    eventName = "engine.recalculate" as const;

    /**
     * The path that the engine found.
     */
    path: Vector2[];

    constructor(path: Vector2[]) {
        super();

        this.path = path;
    }
}
