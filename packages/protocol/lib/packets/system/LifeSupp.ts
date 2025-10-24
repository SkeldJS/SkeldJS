import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export enum LifeSuppConsoleUpdate {
    StartCountdown = 0x80,
    EndCountdown = 0x10,
    CompleteConsole = 0x40,
}

export class LifeSuppSystemMessage extends BaseSystemMessage {
    constructor(consoleAction: LifeSuppConsoleUpdate.StartCountdown|LifeSuppConsoleUpdate.EndCountdown)
    constructor(
        consoleAction: LifeSuppConsoleUpdate.CompleteConsole,
        consoleId: number,
    )
    constructor(
        consoleAction: LifeSuppConsoleUpdate,
        consoleId: number|null,
    )
    constructor(
        public readonly consoleAction: LifeSuppConsoleUpdate,
        public readonly consoleId: number|null = null,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const byte = reader.uint8();
        const consoleId = byte & 0x3;
        if (byte & LifeSuppConsoleUpdate.EndCountdown) {
            return new LifeSuppSystemMessage(LifeSuppConsoleUpdate.EndCountdown);
        } else if (byte & LifeSuppConsoleUpdate.CompleteConsole) {
            return new LifeSuppSystemMessage(LifeSuppConsoleUpdate.CompleteConsole, consoleId);
        } else if (byte & LifeSuppConsoleUpdate.StartCountdown) {
            return new LifeSuppSystemMessage(LifeSuppConsoleUpdate.StartCountdown);
        }
        return new LifeSuppSystemMessage(LifeSuppConsoleUpdate.EndCountdown); // TODO: throw exception. we need exceptions!
    }

    serializeToWriter(writer: HazelWriter) {
        const byte = this.consoleAction | (this.consoleId || 0);
        writer.uint8(byte);
    }

    clone() {
        return new LifeSuppSystemMessage(this.consoleAction, this.consoleId);
    }
}
