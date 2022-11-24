import { HazelReader, HazelWriter } from "@skeldjs/util";
import { ReactorProtocolVersion } from "../../../shared";

export class ReactorHeader {
    static magicString = Buffer.from("726f7463616572", "hex");

    constructor(public readonly version?: ReactorProtocolVersion) {}

    isValid(): this is { version: ReactorProtocolVersion } {
        return this.version !== undefined;
    }

    static Deserialize(reader: HazelReader) {
        if (reader.left === 0)
            return new ReactorHeader(undefined);

        const bReader = HazelReader.from(reader.buffer);
        bReader.goto(reader.cursor);
        const version = bReader.uint8();
        try {
            const magicString = bReader.bytes(ReactorHeader.magicString.byteLength);
            reader.jump(ReactorHeader.magicString.byteLength + 1);

            if (Buffer.compare(magicString.buffer, ReactorHeader.magicString) !== 0)
                return new ReactorHeader(undefined);
        } catch (e) {
            reader.jump(ReactorHeader.magicString.byteLength);
            return new ReactorHeader(undefined);
        }

        return new ReactorHeader(version);
    }

    Serialize(writer: HazelWriter) {
        if (!this.version)
            return;

        writer.uint8(this.version);
        writer.bytes(ReactorHeader.magicString);
    }
}
