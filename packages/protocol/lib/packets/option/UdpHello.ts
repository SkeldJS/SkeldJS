import { Language, QuickChatMode, SendOption } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { PlatformSpecificData } from "../../misc";

import { BaseRootPacket } from "./BaseRootPacket";

export class HelloPacket extends BaseRootPacket {
    static messageTag = SendOption.Hello;

    constructor(
        public readonly nonce: number,
        public readonly encodedVersion: number,
        public readonly username: string,
        public readonly auth: number,
        public readonly language: Language,
        public readonly chatMode: QuickChatMode,
        public readonly platform: PlatformSpecificData,
    ) {
        super(HelloPacket.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const nonce = reader.uint16(true);
        reader.jump(1); // Skip hazel version.
        const encodedVersion = reader.uint32();
        const username = reader.string();
        const auth = reader.uint32();
        const language = reader.uint32();
        const chatMode = reader.uint8();
        const platform = reader.read(PlatformSpecificData);
        reader.string(); // random bytes??
        reader.uint32();

        return new HelloPacket(nonce, encodedVersion, username, auth, language, chatMode, platform);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint16(this.nonce, true);
        writer.uint8(0);
        writer.uint32(this.encodedVersion);
        writer.string(this.username);
        writer.uint32(this.auth);
        writer.uint32(this.language);
        writer.uint8(this.chatMode);
        writer.write(this.platform);
    }

    clone() {
        return new HelloPacket(
            this.nonce,
            this.encodedVersion,
            this.username,
            this.auth,
            this.language,
            this.chatMode,
            this.platform.clone(),
        );
    }
}
