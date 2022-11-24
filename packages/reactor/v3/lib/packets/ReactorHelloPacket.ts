import { SendOption } from "@skeldjs/constant";
import { BaseRootPacket, HelloPacket, MessageDirection, PacketDecoder } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { ReactorHandshakeMessage } from "./ReactorHandshake";
import { ReactorHeader } from "./ReactorHeader";

export class ReactorHelloPacket extends BaseRootPacket {
    static messageTag = SendOption.Hello as const;
    messageTag = SendOption.Hello as const;

    constructor(
        public readonly helloPacket: HelloPacket,
        public readonly header?: ReactorHeader,
        public readonly handshake?: ReactorHandshakeMessage
    ) {
        super();
    }

    isNormalHello(): this is HelloPacket {
        return this.handshake === undefined;
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const helloPacket = reader.read(HelloPacket, direction, decoder);

        if (reader.left) {
            const header = reader.read(ReactorHeader);

            if (!header.isValid()) {
                return new ReactorHelloPacket(helloPacket, undefined, undefined);
            }

            const handshake = reader.read(ReactorHandshakeMessage, direction);

            return new ReactorHelloPacket(
                helloPacket,
                header,
                handshake
            );
        } else {
            return new ReactorHelloPacket(helloPacket);
        }
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        writer.write(this.helloPacket);
        if (!this.isNormalHello()) {
            writer.write(this.handshake!, direction);
        }
    }
}
