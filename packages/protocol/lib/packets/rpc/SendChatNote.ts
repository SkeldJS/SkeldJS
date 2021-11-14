import { ChatNoteType, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SendChatNoteMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SendChatNote as const;
    messageTag = RpcMessageTag.SendChatNote as const;

    playerId: number;
    notetype: ChatNoteType;

    constructor(playerId: number, notetype: ChatNoteType) {
        super();

        this.playerId = playerId;
        this.notetype = notetype;
    }

    static Deserialize(reader: HazelReader) {
        const playerId = reader.uint8();
        const notetype = reader.uint8();

        return new SendChatNoteMessage(playerId, notetype);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.playerId);
        writer.uint8(this.notetype);
    }

    clone() {
        return new SendChatNoteMessage(this.playerId, this.notetype);
    }
}
