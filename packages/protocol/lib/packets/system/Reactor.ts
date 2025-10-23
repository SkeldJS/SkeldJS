import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export enum ReactorConsoleUpdate {
    StartCountdown = 0x80,
    EndCountdown = 0x10,
    AddPlayer = 0x40,
    RemovePlayer = 0x20,
}

export class ReactorSystemMessage extends BaseSystemMessage {
    constructor(consoleAction: ReactorConsoleUpdate.StartCountdown|ReactorConsoleUpdate.EndCountdown)
    constructor(
        consoleAction: ReactorConsoleUpdate.AddPlayer|ReactorConsoleUpdate.RemovePlayer,
        consoleId: number,
    )
    constructor(
        consoleAction: ReactorConsoleUpdate,
        consoleId: number|null,
    )
    constructor(
        public readonly consoleAction: ReactorConsoleUpdate,
        public readonly consoleId: number|null = null,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const byte = reader.uint8();
        const consoleId = byte & 0x3;
        if (byte & ReactorConsoleUpdate.EndCountdown) {
            return new ReactorSystemMessage(ReactorConsoleUpdate.EndCountdown);
        } else if (byte & ReactorConsoleUpdate.RemovePlayer) {
            return new ReactorSystemMessage(ReactorConsoleUpdate.RemovePlayer, consoleId);
        } else if (byte & ReactorConsoleUpdate.AddPlayer) {
            return new ReactorSystemMessage(ReactorConsoleUpdate.AddPlayer, consoleId);
        } else if (byte & ReactorConsoleUpdate.StartCountdown) {
            return new ReactorSystemMessage(ReactorConsoleUpdate.StartCountdown);
        }
        return new ReactorSystemMessage(ReactorConsoleUpdate.EndCountdown); // TODO: throw exception. we need exceptions!
    }

    serializeToWriter(writer: HazelWriter) {
        const byte = this.consoleAction | (this.consoleId || 0);
        writer.uint8(byte);
    }

    clone() {
        return new ReactorSystemMessage(this.consoleAction, this.consoleId);
    }
}
