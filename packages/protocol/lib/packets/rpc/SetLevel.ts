import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetLevelMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetLevel as const;
    messageTag = RpcMessageTag.SetLevel as const;

    constructor(public readonly level: number) {
        super();
    }

    static Deserialize(reader: HazelReader) {
        const level = reader.packed();

        return new SetLevelMessage(level);
    }

    Serialize(writer: HazelWriter) {
        writer.packed(this.level);
    }

    clone() {
        return new SetLevelMessage(this.level);
    }
}
