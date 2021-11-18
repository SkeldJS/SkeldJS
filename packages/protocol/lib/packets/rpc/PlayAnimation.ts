import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRpcMessage } from "./BaseRpcMessage";

export class PlayAnimationMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.PlayAnimation as const;
    messageTag = RpcMessageTag.PlayAnimation as const;

    taskId: number;

    constructor(taskId: number) {
        super();

        this.taskId = taskId;
    }

    static Deserialize(reader: HazelReader) {
        const taskId = reader.uint8();

        return new PlayAnimationMessage(taskId);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.taskId);
    }

    clone() {
        return new PlayAnimationMessage(this.taskId);
    }
}
