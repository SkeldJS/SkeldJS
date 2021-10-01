import { GameKeyword, QuickChatMode, SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter, VersionInfo } from "@skeldjs/util";

import { BaseRootPacket } from "./BaseRootPacket";

export class HelloPacket extends BaseRootPacket {
    static messageTag = SendOption.Hello as const;
    messageTag = SendOption.Hello as const;

    constructor(
        public readonly nonce: number,
        public readonly clientver: VersionInfo,
        public readonly username: string,
        public readonly token: number,
        public readonly language: GameKeyword,
        public readonly chatMode: QuickChatMode
    ) {
        super();
    }

    static Deserialize(reader: HazelReader) {
        const nonce = reader.uint16(true);
        reader.jump(1); // Skip hazel version.
        const clientver = reader.read(VersionInfo);
        const username = reader.string();
        const token = reader.uint32();
        const language = reader.uint32();
        const chatMode = reader.uint8();

        return new HelloPacket(nonce, clientver, username, token, language, chatMode);
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(this.nonce, true);
        writer.uint8(0);
        writer.write(this.clientver);
        writer.string(this.username);
        writer.uint32(this.token);
        writer.uint32(this.language);
        writer.uint8(this.chatMode);
    }

    clone() {
        return new HelloPacket(this.nonce, this.clientver, this.username, this.token, this.language, this.chatMode);
    }
}
