import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ClimbLadderMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.ClimbLadder as const;
    messageTag = RpcMessageTag.ClimbLadder as const;

    ladderid: number;
    sequenceid: number;

    constructor(ladderid: number, sequenceid: number) {
        super();

        this.ladderid = ladderid;
        this.sequenceid = sequenceid;
    }

    static Deserialize(reader: HazelReader) {
        const ladderid = reader.uint8();
        const sequenceid = reader.uint8();

        return new ClimbLadderMessage(ladderid, sequenceid);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.ladderid);
        writer.uint8(this.sequenceid);
    }

    clone() {
        return new ClimbLadderMessage(this.ladderid, this.sequenceid);
    }
}
