import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "../root/BaseRootMessage";
import { PacketDecoder } from "../../PacketDecoder";
import { MessageDirection } from "../../PacketDecoder";
import { BaseRootPacket } from "./BaseRootPacket";

export class NormalPacket extends BaseRootPacket {
    children: BaseRootMessage[];

    constructor(children: BaseRootMessage[]) {
        super();

        this.children = children;
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const rootMessages = decoder.types.get("root");

        if (!rootMessages) return new NormalPacket([]);

        const children: BaseRootMessage[] = [];

        while (reader.left) {
            const [tag, mreader] = reader.message();
            const rootMessageClass = rootMessages.get(tag);

            if (!rootMessageClass) continue;

            const root = rootMessageClass.Deserialize(
                mreader,
                direction,
                decoder
            );
            children.push(root as BaseRootMessage);
        }

        return new NormalPacket(children);
    }

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const rootMessages = decoder.types.get("root");

        if (!rootMessages) return;

        for (const message of this.children) {
            if (!rootMessages.has(message.tag)) continue;

            writer.begin(message.tag);
            writer.write(message, direction, decoder);
            writer.end();
        }
    }
}
