import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetNameMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetName as const;
    messageTag = RpcMessageTag.SetName as const;

    constructor(public readonly netIdToName: number, public readonly name: string) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const netIdToName = reader.uint32(); // unused 
        const name = reader.string();

        return new SetNameMessage(netIdToName, name);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint32(this.netIdToName);
        writer.string(this.name);
    }

    clone() {
        return new SetNameMessage(this.netIdToName, this.name);
    }
}
