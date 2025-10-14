import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter, Vector2 } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SnapToMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SnapTo;

    constructor(public readonly position: Vector2, public readonly sequenceid: number) {
        super(SnapToMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const position = reader.vector();
        const sequenceid = reader.uint16();

        return new SnapToMessage(position, sequenceid);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.vector(this.position);
        writer.uint16(this.sequenceid);
    }

    clone() {
        return new SnapToMessage(this.position.clone(), this.sequenceid);
    }
}
