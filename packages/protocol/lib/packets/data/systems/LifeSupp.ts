import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";
import { CompletedConsoleDataMessage } from "./Consoles";

export class LifeSuppSystemDataMessage extends BaseDataMessage {
    constructor(
        public readonly countdown: number,
        public readonly completedConsoles: CompletedConsoleDataMessage[],
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): LifeSuppSystemDataMessage {
        const timer = reader.float();
        const message = new LifeSuppSystemDataMessage(timer, []);
        const numCompleted = reader.upacked();
        for (let i = 0; i < numCompleted; i++) {
            message.completedConsoles.push(CompletedConsoleDataMessage.deserializeFromReader(reader));
        }
        return message;
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.float(this.countdown);
        writer.upacked(this.completedConsoles.length);
        for (const completedConsole of this.completedConsoles) writer.write(completedConsole);
    }

    clone(): LifeSuppSystemDataMessage {
        return new LifeSuppSystemDataMessage(
            this.countdown,
            this.completedConsoles.map(x => x.clone()),
        );
    }
}