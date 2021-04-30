import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootPacket } from "./BaseRootPacket";

export class HelloPacket extends BaseRootPacket {
    static tag = SendOption.Hello as const;
    tag = SendOption.Hello as const;

    readonly nonce: number;
    readonly clientver: number;
    readonly username: string;
    readonly token: number;

    constructor(
        nonce: number,
        clientver: number,
        username: string,
        token: number
    ) {
        super();

        this.nonce = nonce;
        this.clientver = clientver;
        this.username = username;
        this.token = token;
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
