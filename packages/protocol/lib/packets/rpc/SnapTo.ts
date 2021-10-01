import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter, Vector2 } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SnapToMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SnapTo as const;
    messageTag = RpcMessageTag.SnapTo as const;

    position: Vector2;
    sequenceid: number;

    constructor(position: Vector2, sequenceid: number) {
        super();

        this.position = position;
        this.sequenceid = sequenceid;
    }

    static Deserialize(reader: HazelReader) {
        const position = reader.vector();
        const sequenceid = reader.uint16();

        return new SnapToMessage(position, sequenceid);
    }

    Serialize(writer: HazelWriter) {
        writer.vector(this.position);
        writer.uint16(this.sequenceid);
    }

    clone() {
        return new SnapToMessage(this.position.clone(), this.sequenceid);
    }
}
