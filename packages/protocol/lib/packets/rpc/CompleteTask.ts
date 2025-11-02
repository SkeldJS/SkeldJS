import { RpcMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CompleteTaskMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CompleteTask;

    constructor(public readonly taskIdx: number) {
        super(CompleteTaskMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const taskIdx = reader.upacked();
        return new CompleteTaskMessage(taskIdx);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.taskIdx);
    }

    clone() {
        return new CompleteTaskMessage(this.taskIdx);
    }
}
