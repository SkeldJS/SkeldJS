import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ClimbLadderMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.ClimbLadder;

    constructor(public readonly ladderId: number, public readonly sequenceId: number) {
        super(ClimbLadderMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const ladderid = reader.uint8();
        const sequenceid = reader.uint8();
        return new ClimbLadderMessage(ladderid, sequenceid);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.ladderId);
        writer.uint8(this.sequenceId);
    }

    clone() {
        return new ClimbLadderMessage(this.ladderId, this.sequenceId);
    }
}
