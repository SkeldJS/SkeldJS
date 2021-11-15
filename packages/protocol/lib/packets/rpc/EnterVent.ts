import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class EnterVentMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.EnterVent as const;
    messageTag = RpcMessageTag.EnterVent as const;

    ventId: number;

    constructor(ventId: number) {
        super();

        this.ventId = ventId;
    }

    static Deserialize(reader: HazelReader) {
        const ventId = reader.upacked();

        return new EnterVentMessage(ventId);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.ventId);
    }

    clone() {
        return new EnterVentMessage(this.ventId);
    }
}
