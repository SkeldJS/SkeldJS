import { SendOption } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { PacketDecoder } from "../PacketDecoder";
import { MessageDirection } from "./BaseMessage";
import { RootPacket } from "./RootPacket";
import { RootMessage } from "./RootMessage";

export class NormalPacket extends RootPacket {
    constructor(public readonly tag: number, public readonly messages: RootMessage[]) {
        super(tag);
    }

    static Deserialize(direction: MessageDirection, reader: HazelReader, decoder: PacketDecoder) {
        const rootMessages = decoder.types.get("root");

        const messages: RootMessage[] = [];

        while (reader.left) {
            const [ tag, mreader ] = reader.message();

            const rootMessageType = rootMessages.get(tag);
            const packet = rootMessageType.Deserialize(direction, mreader, decoder);
            messages.push(packet);
        }

        return new NormalPacket(0, messages);
    }

    Serialize(direction: MessageDirection, writer: HazelWriter, decoder: PacketDecoder) {
        const rootMessages = decoder.types.get("root");

        for (const message of this.messages) {
            if (!rootMessages.has(message.tag))
                continue;

            writer.begin(message.tag);
            message.Serialize(direction, writer, decoder);
        }
    }
}
