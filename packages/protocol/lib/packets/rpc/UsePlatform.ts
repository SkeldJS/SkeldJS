import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";
import { HazelWriter } from "@skeldjs/hazel";

export class UsePlatformMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.UsePlatform;

    constructor() { super(UsePlatformMessage.messageTag) }

    static deserializeFromReader() {
        return new UsePlatformMessage;
    }

    serializeToWriter(writer: HazelWriter): void {
        void writer;
    }

    clone() {
        return new UsePlatformMessage;
    }
}
