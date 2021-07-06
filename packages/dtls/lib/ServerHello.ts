import { HazelReader, HazelWriter } from "@skeldjs/util";
import { CipherSuite } from "./enums/CipherSuite";
import { CompressionMethod } from "./enums/CompressionMethod";
import { ProtocolVersion } from "./enums/ProtocolVersion";

export class ServerHello {
    constructor(
        public readonly random: Buffer,
        public readonly cipherSuites: CipherSuite[]
    ) {}

    static Deserialize(reader: HazelReader) {
        const protocolVersion = reader.uint16(true);
        if (protocolVersion !== ProtocolVersion.DTLS1_2) {
            throw new Error("Bad protocol version: " + protocolVersion);
        }

        const randomBytes = reader.bytes(32);
        const sessionIdLen = reader.uint8();
        /* const sessionId =*/ reader.bytes(sessionIdLen);

        const cipherSuite = reader.uint16(true);

        const compressionMethod = reader.uint8();

        if (compressionMethod !== CompressionMethod.Null) {
            throw new Error("No null compression method");
        }

        return new ServerHello(
            randomBytes.buffer,
            [ cipherSuite ]
        );
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(ProtocolVersion.DTLS1_2, true);
        writer.bytes(this.random);

        writer.uint8(0); // session id

        writer.uint16(this.cipherSuites.length * 2, true);
        for (const suite of this.cipherSuites) {
            writer.uint16(suite, true);
        }
        writer.uint8(1); // num compression methods
        writer.uint8(CompressionMethod.Null);
    }
}
