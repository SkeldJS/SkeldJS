import { RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class WaitForHostMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.WaitForHost as const;
    messageTag = RootMessageTag.WaitForHost as const;

    readonly code: number;
    readonly clientid: number;

    constructor(code: string | number, clientid: number) {
        super();

        if (typeof code === "string") {
            this.code = Code2Int(code);
        } else {
            this.code = code;
        }

        this.clientid = clientid;
    }

    static Deserialize(reader: HazelReader) {
        const code = reader.int32();
        const clientid = reader.int32();

        return new WaitForHostMessage(code, clientid);
    }

    Serialize(writer: HazelWriter) {
        writer.int32(this.code);
        writer.int32(this.clientid);
    }

    clone() {
        return new WaitForHostMessage(this.code, this.clientid);
    }
}
