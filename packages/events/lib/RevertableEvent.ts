import { BasicEvent } from "./BasicEvent";

export class RevertableEvent extends BasicEvent {
    pendingRevert: boolean;

    constructor() {
        super();

        this.pendingRevert = false;
    }

    requestRevert() {
        this.pendingRevert = true;
    }
}
