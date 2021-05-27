import { BasicEvent } from "./BasicEvent";

export class CancelableEvent extends BasicEvent {
    canceled: boolean;

    constructor() {
        super();

        this.canceled = false;
    }

    cancel() {
        this.canceled = true;
    }
}
