import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CancelPetMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CancelPet as const;
    messageTag = RpcMessageTag.CancelPet as const;

    static Deserialize() {
        return new CancelPetMessage;
    }

    clone() {
        return new CancelPetMessage;
    }
}
