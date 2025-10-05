import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckNameMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CheckName as const;
    messageTag = RpcMessageTag.CheckName as const;

    name: string;

    constructor(name: string) {
        super();

        this.name = name;
    }

    static deserializeFromReader(reader: HazelReader) {
        const name = reader.string();

        return new CheckNameMessage(name);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.string(this.name);
    }

    clone() {
        return new CheckNameMessage(this.name);
    }
}
