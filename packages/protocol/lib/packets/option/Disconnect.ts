import { DisconnectReason, SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootPacket } from "./BaseRootPacket";

export class DisconnectPacket extends BaseRootPacket {
    static messageTag = SendOption.Disconnect as const;
    messageTag = SendOption.Disconnect as const;

    readonly reason?: DisconnectReason;
    readonly message?: string;
    readonly showReason?: boolean;

    constructor(
        reason?: DisconnectReason,
        message?: string,
        showReason?: boolean
    ) {
        super();

        this.reason = reason;
        this.message = message;
        this.showReason = showReason;
    }

    static Deserialize(reader: HazelReader) {
        if (reader.left) {
            const showReason = reader.bool();

            if (reader.left) {
                const [, mreader] = reader.message();
                const reason = mreader.uint8();

                if (reason === DisconnectReason.Custom && mreader.left) {
                    const message = mreader.string();

                    return new DisconnectPacket(reason, message, showReason);
                }

                return new DisconnectPacket(reason, "", showReason);
            } else {
                return new DisconnectPacket(
                    DisconnectReason.Error,
                    "",
                    showReason
                );
            }
        } else {
            return new DisconnectPacket(DisconnectReason.Error, "", true);
        }
    }

    Serialize(writer: HazelWriter) {
        if (
            typeof this.showReason === "boolean" ||
            typeof this.reason === "number"
        ) {
            if (this.showReason && typeof this.reason === "number") {
                writer.bool(true);

                writer.begin(0);
                writer.uint8(this.reason);

                if (
                    this.reason === DisconnectReason.Custom &&
                    typeof this.message === "string"
                ) {
                    writer.string(this.message);
                }

                writer.end();
            }
        }
    }

    clone() {
        return new DisconnectPacket(this.reason, this.message, this.showReason);
    }
}
