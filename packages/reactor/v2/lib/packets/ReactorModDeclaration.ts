import { HazelReader, HazelWriter } from "@skeldjs/util";
import { ReactorMod } from "../ReactorMod";

import { BaseReactorMessage } from "./BaseReactorMessage";
import { ReactorMessageTag } from "./ReactorMessage";

export class ReactorModDeclarationMessage extends BaseReactorMessage {
    static messageTag = ReactorMessageTag.ModDeclaration as const;
    messageTag = ReactorMessageTag.ModDeclaration as const;

    constructor(
        public readonly netId: number,
        public readonly mod: ReactorMod
    ) {
        super();
    }

    static Deserialize(reader: HazelReader) {
        const netId = reader.upacked();
        const mod = reader.read(ReactorMod);
        return new ReactorModDeclarationMessage(netId, mod);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.netId);
        writer.write(this.mod);
    }
}
