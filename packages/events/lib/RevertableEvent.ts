import { BasicEvent } from "./BasicEvent";

export class RevertableEvent extends BasicEvent {
    reverted: boolean;

    constructor() {
        super();

        this.reverted = false;
    }

    revert() {
        this.reverted = true;
    }
}
