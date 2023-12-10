import { Language, QuickChatMode, SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter, VersionInfo } from "@skeldjs/util";

import { MessageDirection, PacketDecoder } from "../../PacketDecoder";
import { PlatformSpecificData } from "../../misc";

import { BaseRootPacket } from "./BaseRootPacket";

export class HelloPacket extends BaseRootPacket {
    static messageTag = SendOption.Hello as const;
    messageTag = SendOption.Hello as const;

    constructor(
        public readonly nonce: number,
        public readonly clientVer: VersionInfo,
        public readonly username: string,
        public readonly auth: string|number,
        public readonly language: Language,
        public readonly chatMode: QuickChatMode,
        public readonly platform: PlatformSpecificData,
        public readonly friendCode?: string
    ) {
        super();
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
     ) {
        const nonce = reader.uint16(true);
        reader.jump(1); // Skip hazel version.
        const clientVer = reader.read(VersionInfo);
        const username = reader.string();
        let auth: string|number;
        if (decoder.config.useDtlsLayout) {
            auth = reader.string();
        } else {
            auth = reader.uint32();
        }
        const language = reader.uint32();
        const chatMode = reader.uint8();
        const platform = reader.read(PlatformSpecificData);
        if (decoder.config.useDtlsLayout) {
            const friendCode = reader.string();

            return new HelloPacket(nonce, clientVer, username, auth, language, chatMode, platform, friendCode);
        } else {
            reader.string(); // random bytes??
            reader.uint32();

            return new HelloPacket(nonce, clientVer, username, auth, language, chatMode, platform, "");
        }
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(this.nonce, true);
        writer.uint8(0);
        writer.write(this.clientVer);
        writer.string(this.username);
        if (typeof this.auth === "string") {
            writer.string(this.auth);
        } else {
            writer.uint32(this.auth);
        }
        writer.uint32(this.language);
        writer.uint8(this.chatMode);
        writer.write(this.platform);
        if (typeof this.friendCode === "string") {
            writer.string(this.friendCode);
        } else {
            writer.string("");
            writer.uint32(0);
        }
    }

    clone() {
        return new HelloPacket(
            this.nonce,
            this.clientVer,
            this.username,
            this.auth,
            this.language,
            this.chatMode,
            new PlatformSpecificData(
                this.platform.platformTag,
                this.platform.platformName,
                this.platform.platformId
            ),
            this.friendCode
        );
    }
}
