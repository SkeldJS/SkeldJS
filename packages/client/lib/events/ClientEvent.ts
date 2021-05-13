import { CancelableEvent } from "@skeldjs/events";
import { SkeldjsClient } from "../client";

export class ClientEvent extends CancelableEvent {
    client: SkeldjsClient;

    constructor(client: SkeldjsClient) {
        super();

        this.client = client;
    }
}
