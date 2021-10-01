import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "../root/BaseRootMessage";
import { PacketDecoder } from "../../PacketDecoder";
import { MessageDirection } from "../../PacketDecoder";
import { BaseRootPacket } from "./BaseRootPacket";

export class NormalPacket extends BaseRootPacket {
    readonly children: BaseRootMessage[];

    constructor(children: BaseRootMessage[]) {
        super();

        this.children = children;
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const children: BaseRootMessage[] = [];

        while (reader.left) {
            const [tag, mreader] = reader.message();
            const rootMessageClass = decoder.types.get(`root:${tag}`);

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
        for (const message of this.children) {
            if (!decoder.types.has(`root:${message.messageTag}`))
                continue;

            writer.begin(message.messageTag);
            writer.write(message, direction, decoder);
            writer.end();
        }
    }

    clone() {
        return new NormalPacket(this.children.map(child => child.clone()));
    }
}
