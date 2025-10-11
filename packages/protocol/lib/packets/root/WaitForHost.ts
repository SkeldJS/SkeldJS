import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class WaitForHostMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.WaitForHost as const;
    messageTag = RootMessageTag.WaitForHost as const;

    readonly gameId: number;
    readonly clientId: number;

    constructor(gameId: number, clientId: number) {
        super();

        this.gameId = gameId;
        this.clientId = clientId;
    }

    static deserializeFromReader(reader: HazelReader) {
        const code = reader.int32();
        const clientId = reader.int32();

        return new WaitForHostMessage(code, clientId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
        writer.int32(this.clientId);
    }

    clone() {
        return new WaitForHostMessage(this.gameId, this.clientId);
    }
}
