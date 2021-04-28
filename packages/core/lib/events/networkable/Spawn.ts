import { NetworkableEvent } from "./NetworkableEvent";

export class NetworkableSpawnEvent extends NetworkableEvent {
    static eventName = "component.spawn" as const;
    eventName = "component.spawn" as const;
}
