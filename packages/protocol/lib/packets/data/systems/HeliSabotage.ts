import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";
import { ActiveConsoleDataMessage, CompletedConsoleDataMessage } from "./Consoles";

export class HeliSabotageSystemDataMessage extends BaseDataMessage {
    constructor(
        public readonly countdown: number,
        public readonly resetTimer: number,
        public readonly activeConsoles: ActiveConsoleDataMessage[],
        public readonly completedConsoles: CompletedConsoleDataMessage[],
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): HeliSabotageSystemDataMessage {
        const countdown = reader.float();
        const resetTimer = reader.float();
        const message = new HeliSabotageSystemDataMessage(countdown, resetTimer, [], []);
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
        writer.float(this.countdown);
        writer.float(this.resetTimer);
        writer.upacked(this.activeConsoles.length);
        for (const activeConsole of this.activeConsoles) writer.write(activeConsole);
        writer.upacked(this.completedConsoles.length);
        for (const completedConsole of this.completedConsoles) writer.write(completedConsole);
    }

    clone(): HeliSabotageSystemDataMessage {
        return new HeliSabotageSystemDataMessage(
            this.countdown,
            this.resetTimer,
            this.activeConsoles.map(x => x.clone()),
            this.completedConsoles.map(x => x.clone()),
        );
    }
}