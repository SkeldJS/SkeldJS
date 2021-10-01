import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ExitVentMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.ExitVent as const;
    messageTag = RpcMessageTag.ExitVent as const;

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

    clone() {
        return new ExitVentMessage(this.ventid);
    }
}
