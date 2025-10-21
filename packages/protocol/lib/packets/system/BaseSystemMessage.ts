import { HazelReader, HazelWriter } from "@skeldjs/hazel";

export abstract class BaseSystemMessage {
    static deserializeFromReader(reader: HazelReader): BaseSystemMessage {
        throw new Error("No deserialize method implemented");
    }

    abstract serializeToWriter(writer: HazelWriter): void;
    abstract clone(): BaseSystemMessage;
}
