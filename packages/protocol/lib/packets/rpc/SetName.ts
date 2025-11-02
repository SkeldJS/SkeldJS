import { RpcMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetNameMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetName;

    constructor(public readonly netIdToName: number, public readonly name: string) {
        super(SetNameMessage.messageTag);
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
