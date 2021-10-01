import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetNameMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetName as const;
    messageTag = RpcMessageTag.SetName as const;

    name: string;

    constructor(name: string) {
        super();

        this.name = name;
    }

    static Deserialize(reader: HazelReader) {
        const name = reader.string();

        return new SetNameMessage(name);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.name);
    }

    clone() {
        return new SetNameMessage(this.name);
    }
}
