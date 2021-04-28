import { BasicEvent } from "@skeldjs/events";
import { Vector2 } from "@skeldjs/util";

export class EngineRecalculateEvent extends BasicEvent {
    static eventName = "engine.recalculate" as const;
    eventName = "engine.recalculate" as const;

    path: Vector2[];

    constructor(
        path: Vector2[]
    ) {
        super();

        this.path = path;
    }
}
