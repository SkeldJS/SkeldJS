import { DisconnectReason, SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootPacket } from "./BaseRootPacket";

export class DisconnectPacket extends BaseRootPacket {
    static tag = SendOption.Disconnect as const;
    tag = SendOption.Disconnect as const;

    constructor(
        public readonly reason: DisconnectReason = DisconnectReason.None,
        public readonly message: string = "",
        public readonly showReason: boolean = true
    ) {
        super();
    }

    static Deserialize(reader: HazelReader) {
        if (reader.left) {
            const showReason = reader.bool();

            if (reader.left) {
                const [, mreader] = reader.message();
                const reason = mreader.uint8();

                if (reason === DisconnectReason.Custom && reader.left) {
                    const message = reader.string();

                    return new DisconnectPacket(reason, message, showReason);
                }

                return new DisconnectPacket(reason, "", showReason);
            } else {
                return new DisconnectPacket(
                    DisconnectReason.None,
                    "",
                    showReason
                );
            }
        } else {
            return new DisconnectPacket(DisconnectReason.None, "", true);
        }
    }

    Serialize(writer: HazelWriter) {
        if (typeof this.showReason === "boolean") {
            writer.bool(this.showReason);

            if (typeof this.reason === "number") {
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
}
