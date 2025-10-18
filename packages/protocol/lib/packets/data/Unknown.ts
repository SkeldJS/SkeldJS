import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "./BaseDataMessage";

export class UnknownDataMessage extends BaseDataMessage {
    constructor(public readonly dataReader: HazelReader) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): UnknownDataMessage {
        throw new Error("Method not implemented.");
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.bytes(this.dataReader);
    }

    clone() {
        return new UnknownDataMessage(HazelReader.from(this.dataReader));
    }
}