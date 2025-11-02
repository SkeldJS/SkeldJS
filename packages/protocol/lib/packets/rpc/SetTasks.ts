import { RpcMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetTasksMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetTasks;

    constructor(public readonly taskIds: number[]) {
        super(SetTasksMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const taskIds = reader.list((r) => r.uint8());
        return new SetTasksMessage(taskIds);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.list(true, this.taskIds, (t) => writer.uint8(t));
    }

    clone() {
        return new SetTasksMessage([...this.taskIds]);
    }
}
