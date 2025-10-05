import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetTasksMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetTasks as const;
    messageTag = RpcMessageTag.SetTasks as const;

    constructor(public readonly taskIds: number[]) {
        super();
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
