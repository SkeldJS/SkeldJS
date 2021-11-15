import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ExitVentMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.ExitVent as const;
    messageTag = RpcMessageTag.ExitVent as const;

    ventId: number;

    constructor(ventId: number) {
        super();

        this.ventId = ventId;
    }

    static Deserialize(reader: HazelReader) {
        const ventId = reader.upacked();

        return new ExitVentMessage(ventId);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.ventId);
    }

    clone() {
        return new ExitVentMessage(this.ventId);
    }
}
