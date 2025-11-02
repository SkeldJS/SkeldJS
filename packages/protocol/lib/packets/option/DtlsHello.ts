import { Language, QuickChatMode, SendOption } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { PlatformSpecificData } from "../../misc";

import { BaseRootPacket } from "./BaseRootPacket";

export class DtlsHelloPacket extends BaseRootPacket {
    static messageTag = SendOption.Hello;

    constructor(
        public readonly nonce: number,
        public readonly encodedVersion: number,
        public readonly username: string,
        public readonly auth: string,
        public readonly language: Language,
        public readonly chatMode: QuickChatMode,
        public readonly platform: PlatformSpecificData,
        public readonly friendCode: string
    ) {
        super(DtlsHelloPacket.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const nonce = reader.uint16(true);
        reader.jump(1); // Skip hazel version.
        const encodedVersion = reader.uint32();
        const username = reader.string();
        const auth = reader.string();
        const language = reader.uint32();
        const chatMode = reader.uint8();
        const platform = reader.read(PlatformSpecificData);
        const friendCode = reader.string();
        return new DtlsHelloPacket(nonce, encodedVersion, username, auth, language, chatMode, platform, friendCode);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint16(this.nonce, true);
        writer.uint8(0);
        writer.uint32(this.encodedVersion);
        writer.string(this.username);
        writer.string(this.auth);
        writer.uint32(this.language);
        writer.uint8(this.chatMode);
        writer.write(this.platform);
        writer.string(this.friendCode);
    }

    clone() {
        return new DtlsHelloPacket(
            this.nonce,
            this.encodedVersion,
            this.username,
            this.auth,
            this.language,
            this.chatMode,
            this.platform.clone(),
            this.friendCode
        ); 
    }
}
