import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export class UnknownSystemMessage extends BaseSystemMessage {
    constructor(public readonly dataReader: HazelReader) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): UnknownSystemMessage {
        throw new Error("Method not implemented.");
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.bytes(this.dataReader);
    }

    clone() {
        return new UnknownSystemMessage(HazelReader.from(this.dataReader));
    }
}