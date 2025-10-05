import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class SetActivePodTypeMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.SetActivePodType as const;
    messageTag = RootMessageTag.SetActivePodType as const;

    readonly podType: string;

    constructor(podType: string) {
        super();

        this.podType = podType;
    }

    static deserializeFromReader(reader: HazelReader) {
        const podType = reader.string();

        return new SetActivePodTypeMessage(podType);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.string(this.podType);
    }
}
