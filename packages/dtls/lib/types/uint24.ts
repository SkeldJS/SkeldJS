import { HazelReader, HazelWriter } from "@skeldjs/util";

export class uint24 {
    static Deserialize(reader: HazelReader, be = false) {
        const bytes = reader.bytes(3).buffer;
        if (be) {
            return (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
        } else {
            return (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
        }
    }

    static Serialize(writer: HazelWriter, value: number, be = false) {
        if (be) {
            const bytes = [
                ~~(value / (2 ** 16)) & 0xff,
                ~~(value / (2 ** 8)) & 0xff,
                value & 0xff
            ];
            writer.bytes(bytes);
        } else {
            const bytes = [
                value & 0xff,
                ~~(value / (2 ** 8)) & 0xff,
                ~~(value / (2 ** 16)) & 0xff
            ];
            writer.bytes(bytes);
        }
    }
}
