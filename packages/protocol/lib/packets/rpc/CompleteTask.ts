import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CompleteTaskMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.CompleteTask as const;
    tag = RpcMessageTag.CompleteTask as const;

    taskidx: number;

    constructor(taskidx: number) {
        super();

        this.taskidx = taskidx;
    }

    static Deserialize(reader: HazelReader) {
        const taskidx = reader.upacked();

        return new CompleteTaskMessage(taskidx);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.taskidx);
    }
}
