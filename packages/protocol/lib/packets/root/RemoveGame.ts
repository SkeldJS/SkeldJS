import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class RemoveGameMessage extends BaseRootMessage {
    static tag = RootMessageTag.RemoveGame as const;
    tag = RootMessageTag.RemoveGame as const;

    readonly reason: DisconnectReason;

    constructor(reason?: DisconnectReason) {
        super();

        this.reason = reason;
    }

    static Deserialize(reader: HazelReader) {
        const reason = reader.uint8();

        return new RemoveGameMessage(reason);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.reason);
    }
}
