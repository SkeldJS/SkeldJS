import { HazelReader, HazelWriter } from "@skeldjs/util";
import { MessageDirection } from "./packets/BaseMessage";

export interface Serializable {
    tag: number;

    Serialize(
        direction: MessageDirection,
        writer: HazelWriter,
        decoder: PacketDecoder
    );
}

export interface Deserializable {
    tag: number;
    new(tag: number): Serializable;

    Deserialize(
        direction: MessageDirection,
        reader: HazelReader,
        decoder: PacketDecoder
    ): Serializable;
}

export class PacketDecoder {
    types: Map<string, Map<number, Deserializable>>;
}
