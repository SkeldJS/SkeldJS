import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootPacket } from "./BaseRootPacket";

export class HelloPacket extends BaseRootPacket {
    static tag = SendOption.Hello as const;
    tag = SendOption.Hello as const;

    constructor(
        public readonly nonce: number,
        public readonly clientver: number,
        public readonly username: string,
        public readonly token: number
    ) {
        super();
    }

    static Deserialize(reader: HazelReader) {
        const nonce = reader.uint16(true);
        reader.jump(1); // Skip hazel version.
        const clientver = reader.int32();
        const username = reader.string();
        const token = reader.uint32();

        return new HelloPacket(nonce, clientver, username, token);
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(this.nonce, true);
        writer.uint8(0);
        writer.int32(this.clientver);
        writer.string(this.username);
        writer.uint32(this.token);
    }
}
