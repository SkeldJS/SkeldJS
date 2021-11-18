import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CompleteTaskMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CompleteTask as const;
    messageTag = RpcMessageTag.CompleteTask as const;

    taskIdx: number;

    constructor(taskIdx: number) {
        super();

        this.taskIdx = taskIdx;
    }

    static Deserialize(reader: HazelReader) {
        const taskIdx = reader.upacked();

        return new CompleteTaskMessage(taskIdx);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.taskIdx);
    }

    clone() {
        return new CompleteTaskMessage(this.taskIdx);
    }
}
