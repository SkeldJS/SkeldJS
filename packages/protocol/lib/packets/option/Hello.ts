import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter, VersionInfo } from "@skeldjs/util";

import { BaseRootPacket } from "./BaseRootPacket";

export class HelloPacket extends BaseRootPacket {
    static tag = SendOption.Hello as const;
    tag = SendOption.Hello as const;

    readonly nonce: number;
    readonly clientver: VersionInfo;
    readonly username: string;
    readonly token: number;

    constructor(
        nonce: number,
        clientver: VersionInfo,
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
        const clientver = reader.read(VersionInfo);
        const username = reader.string();
        const token = reader.uint32();

        return new HelloPacket(nonce, clientver, username, token);
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(this.nonce, true);
        writer.uint8(0);
        writer.write(this.clientver);
        writer.string(this.username);
        writer.uint32(this.token);
    }
}
