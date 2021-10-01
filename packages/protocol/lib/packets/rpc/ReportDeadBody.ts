import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ReportDeadBodyMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.ReportDeadBody as const;
    messageTag = RpcMessageTag.ReportDeadBody as const;

    bodyid: number;

    constructor(bodyid: number) {
        super();

        this.bodyid = bodyid;
    }

    static Deserialize(reader: HazelReader) {
        const bodyid = reader.uint8();

        return new ReportDeadBodyMessage(bodyid);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.bodyid);
    }

    clone() {
        return new ReportDeadBodyMessage(this.bodyid);
    }
}
