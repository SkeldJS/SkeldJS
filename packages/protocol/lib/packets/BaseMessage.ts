import { HazelReader, HazelWriter } from "@skeldjs/util";
import { MessageDirection, PacketDecoder } from "../PacketDecoder";

export class BaseMessage {
    static type: string;
    static tag: number;

    readonly type: string;
    readonly tag: number;

    private _canceled: boolean;

    constructor() {
        this._canceled = false;
    }

    get canceled() {
        return this._canceled;
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        void reader, direction, decoder;
        return new BaseMessage();
    }

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        void writer, direction, decoder;
    }

    cancel() {
        this._canceled = true;
    }
}
