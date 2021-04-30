import { BasicEvent } from "./BasicEvent";

export class CancelableEvent extends BasicEvent {
    canceled: boolean;

    cancel() {
        this.canceled = true;
    }
}
