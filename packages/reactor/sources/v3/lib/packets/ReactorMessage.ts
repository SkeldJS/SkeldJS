
import { BaseRootMessage, MessageDirection, PacketDecoder } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseReactorMessage } from "./BaseReactorMessage";

export class ReactorMessage extends BaseRootMessage {
    static messageTag = 0xff as const;
    messageTag = 0xff as const;

    children: BaseReactorMessage[];

    constructor(
        message?: BaseReactorMessage
    ) {
        super();

        this.children = message
            ? [message]
            : [];
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const tag = reader.uint8();
        const reactorMessageClass = decoder.types.get(`reactor:${tag}`);

        if (!reactorMessageClass) return new ReactorMessage;

        const reactor = reactorMessageClass.Deserialize(
            reader,
            direction,
            decoder
        );

        return new ReactorMessage(reactor as BaseReactorMessage);
    }

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const child = this.children[0];
        writer.uint8(child.messageTag);
        writer.write(child, direction, decoder);
    }
}
