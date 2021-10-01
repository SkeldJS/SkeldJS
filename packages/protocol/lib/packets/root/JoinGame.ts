import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { MessageDirection } from "../../PacketDecoder";
import { BaseRootMessage } from "./BaseRootMessage";

export class JoinGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.JoinGame as const;
    messageTag = RootMessageTag.JoinGame as const;

    readonly code!: number;
    readonly clientid!: number;
    readonly hostid!: number;

    readonly error!: DisconnectReason;
    readonly message!: string;

    constructor(code: string | number);
    constructor(error: DisconnectReason, message?: string);
    constructor(code: string | number, clientid: number, hostid: number);
    constructor(
        code: string | number,
        clientid?: number | string,
        hostid?: number
    ) {
        super();

        if (typeof code === "number") {
            if (DisconnectReason[code]) {
                this.error = code;

                if (typeof clientid === "string") {
                    this.message = clientid;
                }
            } else {
                this.code = code;
            }
        } else {
            this.code = Code2Int(code);
        }

        if (typeof hostid === "number") {
            this.clientid = clientid as number;
            this.hostid = hostid;
        }
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            const code = reader.int32();

            if (!DisconnectReason[code]) {
                const clientid = reader.int32();
                const hostid = reader.int32();

                return new JoinGameMessage(code, clientid, hostid);
            }

            const message =
                code === DisconnectReason.Custom && reader.left
                    ? reader.string()
                    : undefined;

            return new JoinGameMessage(code, message);
        } else {
            const code = reader.int32();

            return new JoinGameMessage(code);
        }
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            if (this.code) {
                writer.int32(this.code);
                writer.int32(this.clientid);
                writer.int32(this.hostid);
            } else {
                writer.int32(this.error);
                if (
                    this.error === DisconnectReason.Custom &&
                    typeof this.message === "string"
                ) {
                    writer.string(this.message);
                }
            }
        } else {
            writer.int32(this.code ?? this.error);
        }
    }

    clone() {
        if (this.hostid) {
            return new JoinGameMessage(this.code, this.clientid, this.hostid);
        }
        if (this.error !== undefined) {
            return new JoinGameMessage(this.error, this.message);
        }
        return new JoinGameMessage(this.code);
    }
}
