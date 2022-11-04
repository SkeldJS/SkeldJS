import { HazelReader, HazelWriter } from "@skeldjs/util";

export class uint48 {
    static Deserialize(reader: HazelReader, be = false) {
        const bytes = reader.bytes(6).buffer;
        if (be) {
            return (bytes[0] << 40) | (bytes[1] << 32) | (bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
        } else {
            return (bytes[5] << 40) | (bytes[4] << 32) | (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
        }
    }

    static Serialize(writer: HazelWriter, value: number, be = false) {
        if (be) {
            const bytes = [
                ~~(value / (2 ** 40)) & 0xff,
                ~~(value / (2 ** 32)) & 0xff,
                ~~(value / (2 ** 24)) & 0xff,
                ~~(value / (2 ** 16)) & 0xff,
                ~~(value / (2 ** 8)) & 0xff,
                value & 0xff
            ];
            writer.bytes(bytes);
        } else {
            const bytes = [
                value & 0xff,
                ~~(value / (2 ** 8)) & 0xff,
                ~~(value / (2 ** 16)) & 0xff,
                ~~(value / (2 ** 24)) & 0xff,
                ~~(value / (2 ** 32)) & 0xff,
                ~~(value / (2 ** 40)) & 0xff
            ];
            writer.bytes(bytes);
        }
    }
}
