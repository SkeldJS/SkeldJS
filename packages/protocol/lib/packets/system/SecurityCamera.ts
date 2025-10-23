import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export enum SecurityCameraUpdate {
    Remove,
    Add,
}

export class SecurityCameraSystemMessage extends BaseSystemMessage {
    constructor(
        public readonly playerAction: SecurityCameraUpdate,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const playerAction = reader.uint8();
        return new SecurityCameraSystemMessage(playerAction);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.playerAction);
    }

    clone() {
        return new SecurityCameraSystemMessage(this.playerAction);
    }
}
