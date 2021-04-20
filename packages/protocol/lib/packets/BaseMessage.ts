import { HazelReader, HazelWriter } from "@skeldjs/util";
import { MessageDirection, PacketDecoder } from "../PacketDecoder";

export class BaseMessage {
    static type: string;
    static tag: number;

    readonly type: string;
    readonly tag: number;

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        void reader, direction, decoder;
    }

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        void writer, direction, decoder;
    }
}
