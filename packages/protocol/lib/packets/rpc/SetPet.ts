import { Pet, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetPetMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.SetPet as const;
    tag = RpcMessageTag.SetPet as const;

    pet: Pet;

    constructor(pet: Pet) {
        super();

        this.pet = pet;
    }

    static Deserialize(reader: HazelReader) {
        const pet = reader.upacked();

        return new SetPetMessage(pet);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.pet);
    }
}
