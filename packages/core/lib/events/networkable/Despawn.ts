import { NetworkableEvent } from "./NetworkableEvent";

export class NetworkableDespawnEvent extends NetworkableEvent {
    static eventName = "component.despawn" as const;
    eventName = "component.despawn" as const;
}
