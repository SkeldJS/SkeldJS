import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";
import { ActiveConsoleDataMessage, CompletedConsoleDataMessage } from "./Consoles";

export class HqHudSystemDataMessage extends BaseDataMessage {
    constructor(
        public readonly activeConsoles: ActiveConsoleDataMessage[],
        public readonly completedConsoles: CompletedConsoleDataMessage[],
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): HqHudSystemDataMessage {
        const message = new HqHudSystemDataMessage([], []);
        const numActive = reader.upacked();
        for (let i = 0; i < numActive; i++) {
            message.activeConsoles.push(ActiveConsoleDataMessage.deserializeFromReader(reader));
        }
        const numCompleted = reader.upacked();
        for (let i = 0; i < numCompleted; i++) {
            message.completedConsoles.push(CompletedConsoleDataMessage.deserializeFromReader(reader));
        }
        return message;
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.upacked(this.activeConsoles.length);
        for (const activeConsole of this.activeConsoles) writer.write(activeConsole);
        writer.upacked(this.completedConsoles.length);
        for (const completedConsole of this.completedConsoles) writer.write(completedConsole);
    }

    clone(): HqHudSystemDataMessage {
        return new HqHudSystemDataMessage(
            this.activeConsoles.map(x => x.clone()),
            this.completedConsoles.map(x => x.clone()),
        );
    }
}