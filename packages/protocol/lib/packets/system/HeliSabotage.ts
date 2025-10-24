import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export enum HeliSabotageConsoleUpdate {
    StartCountdown = 0x80,
    CompleteConsole = 0x10,
    AddPlayer = 0x40,
    RemovePlayer = 0x20,
}

export class HeliSabotageSystemMessage extends BaseSystemMessage {
    constructor(consoleAction: HeliSabotageConsoleUpdate.StartCountdown)
    constructor(
        consoleAction: HeliSabotageConsoleUpdate.AddPlayer|HeliSabotageConsoleUpdate.RemovePlayer|HeliSabotageConsoleUpdate.CompleteConsole,
        consoleId: number,
    )
    constructor(
        consoleAction: HeliSabotageConsoleUpdate,
        consoleId: number|null,
    )
    constructor(
        public readonly consoleAction: HeliSabotageConsoleUpdate,
        public readonly consoleId: number|null = null,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const byte = reader.uint8();
        const consoleId = byte & 0xf;
        if (byte & HeliSabotageConsoleUpdate.CompleteConsole) {
            return new HeliSabotageSystemMessage(HeliSabotageConsoleUpdate.CompleteConsole, consoleId);
        } else if (byte & HeliSabotageConsoleUpdate.RemovePlayer) {
            return new HeliSabotageSystemMessage(HeliSabotageConsoleUpdate.RemovePlayer, consoleId);
        } else if (byte & HeliSabotageConsoleUpdate.AddPlayer) {
            return new HeliSabotageSystemMessage(HeliSabotageConsoleUpdate.AddPlayer, consoleId);
        } else if (byte & HeliSabotageConsoleUpdate.StartCountdown) {
            return new HeliSabotageSystemMessage(HeliSabotageConsoleUpdate.StartCountdown);
        }
        return new HeliSabotageSystemMessage(HeliSabotageConsoleUpdate.StartCountdown); // TODO: throw exception. we need exceptions!
    }

    serializeToWriter(writer: HazelWriter) {
        const byte = this.consoleAction | (this.consoleId || 0);
        writer.uint8(byte);
    }

    clone() {
        return new HeliSabotageSystemMessage(this.consoleAction, this.consoleId);
    }
}
