import { RootMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseRootMessage } from "./BaseRootMessage";

/**
 * Unimplemented in-game
 */
export class SetGameSessionMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.SetGameSession;

    constructor(public readonly session: string) {
        super(SetGameSessionMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const session = reader.string();
        return new SetGameSessionMessage(session);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.string(this.session);
    }

    clone(): BaseRootMessage {
        return new SetGameSessionMessage(this.session);
    }
}
