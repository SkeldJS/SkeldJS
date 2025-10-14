import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetScanner extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetScanner;

    constructor(public readonly scanning: boolean, public readonly sequenceId: number) {
        super(SetScanner.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const scanning = reader.bool();
        const sequenceId = reader.uint8();

        return new SetScanner(scanning, sequenceId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.bool(this.scanning);
        writer.uint8(this.sequenceId);
    }

    clone() {
        return new SetScanner(this.scanning, this.sequenceId);
    }
}
