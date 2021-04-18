import { DisconnectReason, SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { PacketDecoder } from "../PacketDecoder";
import { MessageDirection } from "./BaseMessage";
import { RootPacket } from "./RootPacket";

export class DisconnectPacket extends RootPacket {
    constructor(
        public readonly reason: DisconnectReason,
        public readonly message: string = "",
        public readonly showReason: boolean = true
    ) {
        super(SendOption.Disconnect);
    }

    static Deserialize(direction: MessageDirection, reader: HazelReader) {
        const showReason = reader.bool();

        if (reader.left) {
            const [ , mreader ] = reader.message();
            const reason = mreader.uint8();

            if (reason === DisconnectReason.Custom && reader.left) {
                const message = reader.string();

                return new DisconnectPacket(reason, message, showReason);
            }

            return new DisconnectPacket(reason, "", showReason);
        } else {
            return new DisconnectPacket(DisconnectReason.None, "", showReason);
        }
    }

    Serialize(direction: MessageDirection, writer: HazelWriter) {
        if (typeof this.showReason === "boolean") {
            writer.bool(this.showReason);

            if (typeof this.reason === "number") {
                writer.begin(0);
                writer.uint8(this.reason);

                if (this.reason === DisconnectReason.Custom &&
                    typeof this.message === "string"
                ) {
                    writer.string(this.message);
                }

                writer.end();
            }
        }
    }
}
