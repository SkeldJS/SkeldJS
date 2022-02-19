import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

/**
 * Unimplemented in-game
 */
export class SetGameSessionMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.SetGameSession as const;
    messageTag = RootMessageTag.SetGameSession as const;

    readonly session: string;

    constructor(session: string) {
        super();

        this.session = session;
    }

    static Deserialize(reader: HazelReader) {
        const session = reader.string();

        return new SetGameSessionMessage(session);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.session);
    }
}
