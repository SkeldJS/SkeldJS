import { HazelReader, HazelWriter } from "@skeldjs/util";
import { uint24 } from "./uint24";

export class uint48 {
    static Deserialize(reader: HazelReader, be = false) {
        // Fix for uint48 acting as signed int32 by @roobscoob
        if (be) {
            const hi = reader.read(uint24);
            const lo = reader.read(uint24);

            return (hi * 0x1000000) + lo;
        } else {
            let val = reader.uint8();
            val |= reader.uint8() << 8;
            val |= reader.uint8() << 16;
            val |= reader.uint8() << 24;
            val >>>= 0;
            val += reader.uint8() * 0x100000000;
            val += reader.uint8() * 0x10000000000;
            return val;
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
