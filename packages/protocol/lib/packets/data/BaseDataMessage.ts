import { HazelReader, HazelWriter } from "@skeldjs/hazel";

export abstract class BaseDataMessage {
    static deserializeFromReader(reader: HazelReader): BaseDataMessage {
        throw new Error("No deserialize method implemented");
    }

    abstract serializeToWriter(writer: HazelWriter): void;
    abstract clone(): BaseDataMessage;
}
