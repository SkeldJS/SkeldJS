import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export enum HqHudConsoleUpdate {
    StartCountdown = 0x80,
    CompleteConsole = 0x10,
    AddPlayer = 0x40,
    RemovePlayer = 0x20,
}

export class HqHudSystemMessage extends BaseSystemMessage {
    constructor(consoleAction: HqHudConsoleUpdate.StartCountdown)
    constructor(
        consoleAction: HqHudConsoleUpdate.AddPlayer|HqHudConsoleUpdate.RemovePlayer|HqHudConsoleUpdate.CompleteConsole,
        consoleId: number,
    )
    constructor(
        consoleAction: HqHudConsoleUpdate,
        consoleId: number|null,
    )
    constructor(
        public readonly consoleAction: HqHudConsoleUpdate,
        public readonly consoleId: number|null = null,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const byte = reader.uint8();
        const consoleId = byte & 0xf;
        if (byte & HqHudConsoleUpdate.CompleteConsole) {
            return new HqHudSystemMessage(HqHudConsoleUpdate.CompleteConsole, consoleId);
        } else if (byte & HqHudConsoleUpdate.RemovePlayer) {
            return new HqHudSystemMessage(HqHudConsoleUpdate.RemovePlayer, consoleId);
        } else if (byte & HqHudConsoleUpdate.AddPlayer) {
            return new HqHudSystemMessage(HqHudConsoleUpdate.AddPlayer, consoleId);
        } else if (byte & HqHudConsoleUpdate.StartCountdown) {
            return new HqHudSystemMessage(HqHudConsoleUpdate.StartCountdown);
        }
        return new HqHudSystemMessage(HqHudConsoleUpdate.StartCountdown); // TODO: throw exception. we need exceptions!
    }

    serializeToWriter(writer: HazelWriter) {
        const byte = this.consoleAction | (this.consoleId || 0);
        writer.uint8(byte);
    }

    clone() {
        return new HqHudSystemMessage(this.consoleAction, this.consoleId);
    }
}
