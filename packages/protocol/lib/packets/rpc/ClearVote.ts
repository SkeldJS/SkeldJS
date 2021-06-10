import { RpcMessageTag } from "@skeldjs/constant";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class ClearVoteMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.ClearVote as const;
    tag = RpcMessageTag.ClearVote as const;

    static Deserialize() {
        return new ClearVoteMessage;
    }
}
