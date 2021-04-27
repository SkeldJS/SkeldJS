import { HqHudSystemEvent } from "./HqHudSystemEvent";

export class HqHudConsoleReset extends HqHudSystemEvent {
    static eventName = "hqhud.consoles.reset" as const;
    eventName = "hqhud.consoles.reset" as const;
}
