import { O2SystemEvent } from "./O2SystemEvent";

export class O2ConsoleClearEvent extends O2SystemEvent {
    static eventName = "o2.consoles.clear" as const;
    eventName = "o2.consoles.clear" as const;
}
