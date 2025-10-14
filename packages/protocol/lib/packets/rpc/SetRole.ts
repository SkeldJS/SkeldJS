import { RoleType, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetRoleMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetRole;

    constructor(
        public readonly roleType: RoleType
    ) {
        super(SetRoleMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const roleType = reader.uint16();
        return new SetRoleMessage(roleType);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint16(this.roleType);
    }

    clone(): BaseRpcMessage {
        return new SetRoleMessage(this.roleType);
    }
}
