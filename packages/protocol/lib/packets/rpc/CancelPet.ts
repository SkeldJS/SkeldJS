import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";
import { HazelWriter } from "@skeldjs/hazel";

export class CancelPetMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CancelPet;

    constructor() {
        super(CancelPetMessage.messageTag);
    }

    static deserializeFromReader() {
        return new CancelPetMessage;
    }

    serializeToWriter(writer: HazelWriter): void {
        void writer;
    }

    clone() {
        return new CancelPetMessage;
    }
}
