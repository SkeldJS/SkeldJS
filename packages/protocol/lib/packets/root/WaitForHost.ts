import { RootMessageTag } from "@skeldjs/constant";
import { GameCode, HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class WaitForHostMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.WaitForHost as const;
    messageTag = RootMessageTag.WaitForHost as const;

    readonly code: number;
    readonly clientId: number;

    constructor(code: string | number, clientId: number) {
        super();

        if (typeof code === "string") {
            this.code = GameCode.convertStringToInt(code);
        } else {
            this.code = code;
        }

        this.clientId = clientId;
    }

    static Deserialize(reader: HazelReader) {
        const code = reader.int32();
        const clientId = reader.int32();

        return new WaitForHostMessage(code, clientId);
    }

    Serialize(writer: HazelWriter) {
        writer.int32(this.code);
        writer.int32(this.clientId);
    }

    clone() {
        return new WaitForHostMessage(this.code, this.clientId);
    }
}
