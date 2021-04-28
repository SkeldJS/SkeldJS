import { NetworkableEvent } from "./NetworkableEvent";

/**
 * Emitted when a component is spawned.
 */
export class NetworkableSpawnEvent extends NetworkableEvent {
    static eventName = "component.spawn" as const;
    eventName = "component.spawn" as const;
}
