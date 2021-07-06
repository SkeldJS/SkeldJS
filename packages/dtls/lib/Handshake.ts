import { HazelReader, HazelWriter } from "@skeldjs/util";
import { HandshakeType } from "./enums/HandshakeType";
import { uint24 } from "./types/uint24";

export class Handshake {
    constructor(
        public readonly messageType: HandshakeType,
        public readonly length: number,
        public readonly messageSequence: number,
        public readonly fragmentOffset: number,
        public readonly fragmentLength: number
    ) {}

    static Deserialize(reader: HazelReader) {
        const messageType = reader.uint8();
        const length = reader.read(uint24, true);
        const messageSequence = reader.uint16(true);
        const fragmentOffset = reader.read(uint24, true);
        const fragmentLength = reader.read(uint24, true);

        return new Handshake(messageType, length, messageSequence, fragmentOffset, fragmentLength);
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.messageType);
        writer.write(uint24, this.length, true);
        writer.uint16(this.messageSequence, true);
        writer.write(uint24, this.fragmentOffset, true);
        writer.write(uint24, this.fragmentLength, true);
    }
}
