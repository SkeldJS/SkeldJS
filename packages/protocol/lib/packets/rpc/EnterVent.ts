import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class EnterVentMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.EnterVent as const;
    messageTag = RpcMessageTag.EnterVent as const;

    ventid: number;

    constructor(ventid: number) {
        super();

        this.ventid = ventid;
    }

    static Deserialize(reader: HazelReader) {
        const ventid = reader.upacked();

        return new EnterVentMessage(ventid);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.ventid);
    }

    clone() {
        return new EnterVentMessage(this.ventid);
    }
}
