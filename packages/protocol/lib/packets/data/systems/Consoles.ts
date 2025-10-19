import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";

export class ActiveConsoleDataMessage extends BaseDataMessage {
    constructor(public readonly playerId: number, public readonly consoleId: number) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): ActiveConsoleDataMessage {
        const playerId = reader.uint8();
        const consoleId = reader.uint8();
        return new ActiveConsoleDataMessage(playerId, consoleId);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.uint8(this.playerId);
        writer.uint8(this.consoleId);
    }

    clone(): ActiveConsoleDataMessage {
        return new ActiveConsoleDataMessage(this.playerId, this.consoleId);
    }
}

export class CompletedConsoleDataMessage extends BaseDataMessage {
    constructor(public readonly consoleId: number) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): CompletedConsoleDataMessage {
        const consoleId = reader.uint8();
        return new CompletedConsoleDataMessage(consoleId);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.uint8(this.consoleId);
    }

    clone(): CompletedConsoleDataMessage {
        return new CompletedConsoleDataMessage(this.consoleId);
    }
}