import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseRpcMessage } from "./BaseRpcMessage";

export class PlayAnimationMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.PlayAnimation;

    constructor(public readonly taskId: number) {
        super(PlayAnimationMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const taskId = reader.uint8();

        return new PlayAnimationMessage(taskId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.taskId);
    }

    clone() {
        return new PlayAnimationMessage(this.taskId);
    }
}
