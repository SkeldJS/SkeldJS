import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class UnknownGameDataMessage extends BaseGameDataMessage {
    constructor(public readonly messageTag: number, public readonly dataReader: HazelReader) {
        super(messageTag);
    }

    static deserializeFromReader(reader: HazelReader): UnknownGameDataMessage {
        throw new Error("Method not implemented.");
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.bytes(this.dataReader);
    }

    clone() {
        return new UnknownGameDataMessage(this.messageTag, HazelReader.from(this.dataReader));
    }
}