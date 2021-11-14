import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetPetMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetPet as const;
    messageTag = RpcMessageTag.SetPet as const;

    petId: string;

    constructor(petId: string) {
        super();

        this.petId = petId;
    }

    static Deserialize(reader: HazelReader) {
        const petId = reader.string();

        return new SetPetMessage(petId);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.petId);
    }

    clone() {
        return new SetPetMessage(this.petId);
    }
}
