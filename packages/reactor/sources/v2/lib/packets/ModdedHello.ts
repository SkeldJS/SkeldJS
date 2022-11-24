import { SendOption } from "@skeldjs/constant";
import { BaseRootPacket, HelloPacket, MessageDirection, PacketDecoder } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";

export class ModdedHelloPacket extends BaseRootPacket {
    static messageTag = SendOption.Hello as const;
    messageTag = SendOption.Hello as const;

    constructor(
        public readonly helloPacket: HelloPacket,
        public readonly reactorVersion?: number,
        public readonly modCount?: number
    ) {
        super();
    }

    isNormalHello(): this is HelloPacket {
        return this.reactorVersion === undefined;
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const helloPacket = reader.read(HelloPacket, direction, decoder);

        if (reader.left) {
            const protocolversion = reader.uint8();
            const modcount = reader.packed();

            return new ModdedHelloPacket(
                helloPacket,
                protocolversion,
                modcount
            );
        } else {
            return new ModdedHelloPacket(helloPacket);
        }
    }

    Serialize(writer: HazelWriter) {
        writer.write(this.helloPacket);
        if (!this.isNormalHello()) {
            writer.uint8(this.reactorVersion || 0);
            writer.packed(this.modCount || 0);
        }
    }
}
