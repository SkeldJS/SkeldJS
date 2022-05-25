import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { GameCode, HazelReader, HazelWriter } from "@skeldjs/util";

import { MessageDirection } from "../../PacketDecoder";
import { BaseRootMessage } from "./BaseRootMessage";

export class RemovePlayerMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.RemovePlayer as const;
    messageTag = RootMessageTag.RemovePlayer as const;

    readonly code: number;
    readonly clientId: number;
    readonly hostId!: number;
    readonly reason: DisconnectReason;

    constructor(
        code: string | number,
        clientId: number,
        reason: DisconnectReason,
        hostId?: number
    ) {
        super();

        if (typeof code === "string") {
            this.code = GameCode.convertStringToInt(code);
        } else {
            this.code = code;
        }

        this.clientId = clientId;
        this.reason = reason;

        if (hostId) this.hostId = hostId;
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            const code = reader.int32();
            const clientId = reader.int32();
            const hostId = reader.int32();
            const reason = reader.uint8();

            return new RemovePlayerMessage(code, clientId, reason, hostId);
        } else {
            const code = reader.int32();
            const clientId = reader.packed();
            const reason = reader.uint8();

            return new RemovePlayerMessage(code, clientId, reason);
        }
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            writer.int32(this.code);
            writer.int32(this.clientId);
            writer.int32(this.hostId);
            writer.uint8(this.reason);
        } else {
            writer.int32(this.code);
            writer.packed(this.clientId);
            writer.uint8(this.reason);
        }
    }

    clone() {
        return new RemovePlayerMessage(this.code, this.clientId, this.reason, this.hostId);
    }
}
