import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter, Vector2 } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class PetMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.Pet as const;
    messageTag = RpcMessageTag.Pet as const;

    constructor(public readonly playerPos: Vector2, public readonly petPos: Vector2) {
        super();
    }

    static Deserialize(reader: HazelReader) {
        const playerPos = reader.vector();
        const petPos = reader.vector();

        return new PetMessage(playerPos, petPos);
    }

    Serialize(writer: HazelWriter) {
        writer.vector(this.playerPos);
        writer.vector(this.petPos);
    }

    clone() {
        return new PetMessage(this.playerPos.clone(), this.petPos.clone());
    }
}
