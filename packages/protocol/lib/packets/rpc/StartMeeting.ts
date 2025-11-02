import { RpcMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class StartMeetingMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.StartMeeting;

    constructor(public readonly bodyId: number) {
        super(StartMeetingMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const bodyid = reader.uint8();

        return new StartMeetingMessage(bodyid);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.bodyId);
    }

    clone() {
        return new StartMeetingMessage(this.bodyId);
    }
}
