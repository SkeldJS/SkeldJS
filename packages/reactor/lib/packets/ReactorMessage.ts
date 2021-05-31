
import { BaseRootMessage, MessageDirection, PacketDecoder } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseReactorMessage } from "./BaseReactorMessage";

export enum ReactorMessageTag {
    Handshake,
    ModDeclaration,
    PluginDeclaration
}

export class ReactorMessage extends BaseRootMessage {
    static tag = 0xff as const;
    tag = 0xff as const;

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
        const reactorMessages = decoder.types.get("reactor");

        if (!reactorMessages) return new ReactorMessage;

        const tag = reader.uint8();
        const reactorMessageClass = reactorMessages.get(tag);

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

        if (!child)
            return;

        const reactorMessages = decoder.types.get("reactor");

        if (!reactorMessages || !reactorMessages.has(child.tag)) return;

        writer.uint8(child.tag);
        writer.write(child, direction, decoder);
    }
}
