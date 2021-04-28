import { CancelableEvent } from "@skeldjs/events";
import { Vector2 } from "@skeldjs/util";

export class EngineMoveEvent extends CancelableEvent {
    static eventName = "engine.move" as const;
    eventName = "engine.move" as const;

    position: Vector2;

    constructor(
        position: Vector2
    ) {
        super();

        this.position = position;
    }
}
