import { HqHudSystemEvent } from "./HqHudSystemEvent";

export class HqHudConsoleResetEvent extends HqHudSystemEvent {
    static eventName = "hqhud.consoles.reset" as const;
    eventName = "hqhud.consoles.reset" as const;
}
