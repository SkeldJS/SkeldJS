import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ClearVoteMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.ClearVote as const;
    messageTag = RpcMessageTag.ClearVote as const;

    static Deserialize() {
        return new ClearVoteMessage;
    }

    clone() {
        return new ClearVoteMessage;
    }
}
