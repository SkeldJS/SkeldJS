import { HazelReader, HazelWriter } from "@skeldjs/util";
import { ReactorProtocolVersion } from "../../../shared";

export class ReactorHeader {
    static magicString = Buffer.from("72656163746f72", "hex");

    constructor(public readonly version?: ReactorProtocolVersion) {}

    isValid(): this is { version: ReactorProtocolVersion } {
        return this.version !== undefined;
    }

    static Deserialize(reader: HazelReader) {
        const bReader = HazelReader.from(reader.buffer);
        bReader.goto(reader.cursor);
        try {
            const magicString = bReader.bytes(ReactorHeader.magicString.byteLength);

            if (Buffer.compare(magicString.buffer, ReactorHeader.magicString) !== 0)
                return new ReactorHeader(undefined);

            reader.jump(ReactorHeader.magicString.byteLength);
        } catch (e) {
            return new ReactorHeader(undefined);
        }

        const version = reader.uint8();
        return new ReactorHeader(version);
    }

    Serialize(writer: HazelWriter) {
        if (!this.version)
            return;

        writer.bytes(ReactorHeader.magicString);
        writer.uint8(this.version);
    }
}
