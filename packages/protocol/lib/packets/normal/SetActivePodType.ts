import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseRootMessage } from "./BaseRootMessage";

export class SetActivePodTypeMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.SetActivePodType;

    constructor(public readonly podType: string) {
        super(SetActivePodTypeMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const podType = reader.string();
        return new SetActivePodTypeMessage(podType);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.string(this.podType);
    }

    clone(): BaseRootMessage {
        return new SetActivePodTypeMessage(this.podType);
    }
}
