import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class RemoveGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.RemoveGame as const;
    messageTag = RootMessageTag.RemoveGame as const;

    readonly reason: DisconnectReason;

    constructor(reason?: DisconnectReason) {
        super();

        this.reason = reason || DisconnectReason.Error;
    }

    static Deserialize(reader: HazelReader) {
        const reason = reader.uint8();

        return new RemoveGameMessage(reason);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.reason);
    }

    clone() {
        return new RemoveGameMessage(this.reason);
    }
}
