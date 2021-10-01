import { RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class JoinedGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.JoinedGame as const;
    messageTag = RootMessageTag.JoinedGame as const;

    readonly code: number;
    readonly clientid: number;
    readonly hostid: number;
    readonly others: number[];

    constructor(
        code: string | number,
        clientid: number,
        hostid: number,
        others: number[]
    ) {
        super();

        if (typeof code === "string") {
            this.code = Code2Int(code);
        } else {
            this.code = code;
        }

        this.clientid = clientid;
        this.hostid = hostid;
        this.others = others;
    }

    static Deserialize(reader: HazelReader) {
        const code = reader.int32();
        const clientid = reader.int32();
        const hostid = reader.int32();
        const others = reader.list((r) => r.packed());

        return new JoinedGameMessage(code, clientid, hostid, others);
    }

    Serialize(writer: HazelWriter) {
        writer.int32(this.code);
        writer.int32(this.clientid);
        writer.int32(this.hostid);
        writer.list(true, this.others, (other) => writer.packed(other));
    }

    clone() {
        return new JoinedGameMessage(this.code, this.clientid, this.hostid, [...this.others]);
    }
}
