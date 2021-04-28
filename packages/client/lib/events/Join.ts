import { CancelableEvent } from "@skeldjs/events";

export class ClientJoinEvent extends CancelableEvent {
    static eventNamee = "client.join" as const;
    eventName = "client.join" as const;
}
