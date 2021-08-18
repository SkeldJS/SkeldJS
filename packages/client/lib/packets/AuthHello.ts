import { Platform, SendOption } from "@skeldjs/constant";
import { BaseRootPacket } from "@skeldjs/protocol";
import { HazelReader, HazelWriter, VersionInfo } from "@skeldjs/util";

export class AuthHelloPacket extends BaseRootPacket {
    static messageTag = SendOption.Hello as const;
    messageTag = SendOption.Hello as const;

    constructor(
        public readonly nonce: number,
        public readonly clientVersion: VersionInfo,
        public readonly platform: Platform,
        public readonly authId: string
    ) {
        super();
    }

    static Deserialize(reader: HazelReader) {
        const nonce = reader.uint16(true);
        reader.jump(1);
        const clientVersion = reader.read(VersionInfo);
        const platform = reader.uint8();
        const authId = reader.string();

        return new AuthHelloPacket(nonce, clientVersion, platform, authId);
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(this.nonce, true);
        writer.uint8(0);
        writer.write(this.clientVersion);
        writer.uint8(this.platform);
        writer.string(this.authId);
    }
}
