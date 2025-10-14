import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class ReadyMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Ready;

    constructor(public readonly clientId: number) {
        super(ReadyMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const clientId = reader.packed();
        return new ReadyMessage(clientId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.packed(this.clientId);
    }

    clone() {
        return new ReadyMessage(this.clientId);
    }
}
