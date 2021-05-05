import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ExitVentMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.ExitVent as const;
    tag = RpcMessageTag.ExitVent as const;

    ventid: number;

    constructor(ventid: number) {
        super();

        this.ventid = ventid;
    }

    static Deserialize(reader: HazelReader) {
        const ventid = reader.upacked();

        return new ExitVentMessage(ventid);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.ventid);
    }
}
