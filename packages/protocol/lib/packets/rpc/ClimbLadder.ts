import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ClimbLadderMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.ClimbLadder as const;
    tag = RpcMessageTag.ClimbLadder as const;

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
}
