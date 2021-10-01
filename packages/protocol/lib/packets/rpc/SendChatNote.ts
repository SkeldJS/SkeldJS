import { ChatNoteType, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SendChatNoteMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SendChatNote as const;
    messageTag = RpcMessageTag.SendChatNote as const;

    playerid: number;
    notetype: ChatNoteType;

    constructor(playerid: number, notetype: ChatNoteType) {
        super();

        this.playerid = playerid;
        this.notetype = notetype;
    }

    static Deserialize(reader: HazelReader) {
        const playerid = reader.uint8();
        const notetype = reader.uint8();

        return new SendChatNoteMessage(playerid, notetype);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.playerid);
        writer.uint8(this.notetype);
    }

    clone() {
        return new SendChatNoteMessage(this.playerid, this.notetype);
    }
}
