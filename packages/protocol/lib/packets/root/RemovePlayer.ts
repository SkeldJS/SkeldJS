import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { MessageDirection } from "../../PacketDecoder";
import { BaseRootMessage } from "./BaseRootMessage";

export class RemovePlayerMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.RemovePlayer as const;
    messageTag = RootMessageTag.RemovePlayer as const;

    readonly code: number;
    readonly clientid: number;
    readonly hostid!: number;
    readonly reason: DisconnectReason;

    constructor(
        code: string | number,
        clientid: number,
        reason: DisconnectReason,
        hostid?: number
    ) {
        super();

        if (typeof code === "string") {
            this.code = Code2Int(code);
        } else {
            this.code = code;
        }

        this.clientid = clientid;
        this.reason = reason;

        if (hostid) this.hostid = hostid;
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            const code = reader.int32();
            const clientid = reader.int32();
            const hostid = reader.int32();
            const reason = reader.uint8();

            return new RemovePlayerMessage(code, clientid, reason, hostid);
        } else {
            const code = reader.int32();
            const clientid = reader.packed();
            const reason = reader.uint8();

            return new RemovePlayerMessage(code, clientid, reason);
        }
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            writer.int32(this.code);
            writer.int32(this.clientid);
            writer.int32(this.hostid);
            writer.uint8(this.reason);
        } else {
            writer.int32(this.code);
            writer.packed(this.clientid);
            writer.uint8(this.reason);
        }
    }

    clone() {
        return new RemovePlayerMessage(this.code, this.clientid, this.reason, this.hostid);
    }
}
