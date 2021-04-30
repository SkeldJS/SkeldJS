import { NetworkableEvent } from "./NetworkableEvent";

/**
 * Emitted when a component is despawned.
 */
export class NetworkableDespawnEvent extends NetworkableEvent {
    static eventName = "component.despawn" as const;
    eventName = "component.despawn" as const;
}
