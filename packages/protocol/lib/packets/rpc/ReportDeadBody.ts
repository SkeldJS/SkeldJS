import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ReportDeadBodyMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.ReportDeadBody;

    constructor(public readonly bodyId: number) {
        super(ReportDeadBodyMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const bodyid = reader.uint8();
        return new ReportDeadBodyMessage(bodyid);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.bodyId);
    }

    clone() {
        return new ReportDeadBodyMessage(this.bodyId);
    }
}
