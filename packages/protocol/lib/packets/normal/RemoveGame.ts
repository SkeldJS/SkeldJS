import { DisconnectReason, RootMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseRootMessage } from "./BaseRootMessage";

export class RemoveGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.RemoveGame;

    constructor(public readonly reason?: DisconnectReason) {
        super(RemoveGameMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const reason = reader.uint8();

        return new RemoveGameMessage(reason);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.reason || DisconnectReason.Error);
    }

    clone() {
        return new RemoveGameMessage(this.reason);
    }
}
