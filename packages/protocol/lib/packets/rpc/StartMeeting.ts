import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class StartMeetingMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.StartMeeting as const;
    messageTag = RpcMessageTag.StartMeeting as const;

    bodyid: number;

    constructor(bodyid: number) {
        super();

        this.bodyid = bodyid;
    }

    static Deserialize(reader: HazelReader) {
        const bodyid = reader.uint8();

        return new StartMeetingMessage(bodyid);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.bodyid);
    }

    clone() {
        return new StartMeetingMessage(this.bodyid);
    }
}
