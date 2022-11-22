import { Language, QuickChatMode, SendOption } from "@skeldjs/constant";
import { BaseRootPacket, HelloPacket, MessageDirection, PacketDecoder, PlatformSpecificData } from "@skeldjs/protocol";
import { HazelReader, HazelWriter, VersionInfo } from "@skeldjs/util";

export class ModdedHelloPacket extends BaseRootPacket {
    static messageTag = SendOption.Hello as const;
    messageTag = SendOption.Hello as const;

    constructor(
        public readonly nonce: number,
        public readonly clientver: VersionInfo,
        public readonly username: string,
        public readonly auth: string|number,
        public readonly language: Language,
        public readonly chatMode: QuickChatMode,
        public readonly platform: PlatformSpecificData,
        public readonly protocolver?: number,
        public readonly modcount?: number,
    ) {
        super();
    }

    isNormalHello(): this is HelloPacket {
        return this.protocolver === undefined;
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const nonce = reader.uint16(true);
        reader.jump(1); // Skip hazel version.
        const clientverint = reader.int32();
        const username = reader.string();

        const clientver = VersionInfo.from(clientverint);
        let auth: string|number;
        if (decoder.config.useDtlsLayout) {
            auth = reader.string();
        } else {
            auth = reader.uint32();
        }
        const language = reader.uint32();
        const chatMode = reader.uint8();
        const platform = reader.read(PlatformSpecificData);

        if (reader.left) {
            const protocolversion = reader.uint8();
            const modcount = reader.packed();

            return new ModdedHelloPacket(
                nonce,
                clientver,
                username,
                auth,
                language,
                chatMode,
                platform,
                protocolversion,
                modcount
            );
        } else {
            return new ModdedHelloPacket(
                nonce,
                clientver,
                username,
                auth,
                language,
                chatMode,
                platform
            );
        }
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(this.nonce, true);
        writer.write(this.clientver);
        writer.string(this.username);
        if (typeof this.auth === "string") {
            writer.string(this.auth);
        } else {
            writer.uint32(this.auth);
        }
        writer.uint32(this.language);
        writer.uint8(this.chatMode);
        writer.write(this.platform);
        writer.uint8(this.protocolver || 0);
        writer.packed(this.modcount || 0);
    }
}
