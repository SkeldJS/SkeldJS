import { HazelReader, HazelWriter } from "@skeldjs/util";
import { ProtocolVersion } from "./enums/ProtocolVersion";

export class HelloVerifyRequest {
    constructor(
        public readonly cookie: Buffer
    ) {}

    static Deserialize(reader: HazelReader) {
        const protocolVersion = reader.uint16(true);
        if (protocolVersion !== ProtocolVersion.DTLS1_2) {
            throw new Error("Bad protocol version: " + protocolVersion);
        }

        const cookieLen = reader.uint8();
        const cookie = reader.bytes(cookieLen);

        return new HelloVerifyRequest(cookie.buffer);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.cookie.byteLength);
        writer.bytes(this.cookie);
    }
}
