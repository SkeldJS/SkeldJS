import { RootMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseRootMessage } from "./BaseRootMessage";

export class WaitForHostMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.WaitForHost;

    constructor(public readonly gameId: number, public readonly clientId: number) {
        super(WaitForHostMessage.messageTag);
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
