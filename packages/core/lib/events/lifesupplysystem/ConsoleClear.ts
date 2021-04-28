import { O2SystemEvent } from "./O2SystemEvent";

/**
 * Emitted when the o2 consoles are cleared, either from them being completed or from the timer reaching 0.
 */
export class O2ConsoleClearEvent extends O2SystemEvent {
    static eventName = "o2.consoles.clear" as const;
    eventName = "o2.consoles.clear" as const;
}
