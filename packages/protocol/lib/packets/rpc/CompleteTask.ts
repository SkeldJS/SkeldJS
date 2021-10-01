import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CompleteTaskMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CompleteTask as const;
    messageTag = RpcMessageTag.CompleteTask as const;

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

    clone() {
        return new CompleteTaskMessage(this.taskidx);
    }
}
