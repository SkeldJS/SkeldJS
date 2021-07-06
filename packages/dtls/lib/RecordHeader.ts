import { HazelReader, HazelWriter } from "@skeldjs/util";
import { ContentType } from "./enums/ContentType";
import { ProtocolVersion } from "./enums/ProtocolVersion";
import { uint48 } from "./types/uint48";

export class RecordHeader {
    static size = 13 as const;

    constructor(
        public readonly contentType: ContentType,
        public readonly epoch: number,
        public readonly sequenceNumber: number,
        public length: number
    ) {}

    static Deserialize(reader: HazelReader) {
        const contentType = reader.uint8();
        const protocolVersion = reader.uint16(true);

        const epoch = reader.uint16(true);
        const sequenceNumber = reader.read(uint48, true);
        const length = reader.uint16(true);

        if (protocolVersion !== ProtocolVersion.DTLS1_2) {
            throw new Error("Bad protocol version: " + protocolVersion);
        }

        return new RecordHeader(contentType, epoch, sequenceNumber, length);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.contentType);
        writer.uint16(ProtocolVersion.DTLS1_2, true);
        writer.uint16(this.epoch, true);
        writer.write(uint48, this.sequenceNumber, true);
        writer.uint16(this.length, true);
    }
}
