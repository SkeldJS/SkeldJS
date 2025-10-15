import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetPetMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetPet;

    constructor(public readonly petId: string, public readonly sequenceId: number) {
        super(SetPetMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const petId = reader.string();
        const sequenceId = reader.uint8();

        return new SetPetMessage(petId, sequenceId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.string(this.petId);
        writer.uint8(this.sequenceId);
    }

    clone() {
        return new SetPetMessage(this.petId, this.sequenceId);
    }
}
