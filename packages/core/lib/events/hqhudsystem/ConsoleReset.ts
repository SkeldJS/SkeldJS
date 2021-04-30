import { HqHudSystemEvent } from "./HqHudSystemEvent";

/**
 * Emitted when the timer for the consoles to be completed on Mira HQ reaches 0s and they must be re-completed.
 */
export class HqHudConsoleResetEvent extends HqHudSystemEvent {
    static eventName = "hqhud.consoles.reset" as const;
    eventName = "hqhud.consoles.reset" as const;
}
