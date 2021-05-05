import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetInfectedMessage extends BaseRpcMessage {
    impostors: number[];

    constructor(impostors: number[]) {
        super();

        this.impostors = impostors;
    }

    static Deserialize(reader: HazelReader) {
        const impostors = reader.list((r) => r.uint8());

        return new SetInfectedMessage(impostors);
    }

    Serialize(writer: HazelWriter) {
        writer.list(true, this.impostors, (i) => writer.uint8(i));
    }
}
