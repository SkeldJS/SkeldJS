import { RpcMessageTag, StringNames } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export enum QuickChatContentType {
    Empty,
    Player,
    Simple,
    Complex
}

export class BaseQuickChatMessageData {
    constructor(
        public readonly contentType: QuickChatContentType
    ) {}

    static Deserialize(reader: HazelReader) {

    }

    Serialize(writer: HazelWriter) {

    }

    clone() {

    }
}

export class QuickChatPlayerMessageData extends BaseQuickChatMessageData {
    constructor(
        public readonly playerId: number
    ) {
        super(QuickChatContentType.Player);
    }

    static Deserialize(reader: HazelReader) {
        return new QuickChatPlayerMessageData(reader.uint8());
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.playerId);
    }

    clone() {
        return new QuickChatPlayerMessageData(this.playerId);
    }
}

export class QuickChatSimpleMessageData extends BaseQuickChatMessageData {
    constructor(
        public readonly formatString: number
    ) {
        super(QuickChatContentType.Simple);
    }

    static Deserialize(reader: HazelReader) {
        return new QuickChatSimpleMessageData(reader.uint16());
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(this.formatString);
    }

    clone() {
        return new QuickChatSimpleMessageData(this.formatString);
    }
}

export class QuickChatComplexMessageData extends BaseQuickChatMessageData {
    constructor(
        public readonly formatString: number,
        public readonly elements: (QuickChatSimpleMessageData|QuickChatPlayerMessageData|undefined)[]
    ) {
        super(QuickChatContentType.Complex);
    }

    static Deserialize(reader: HazelReader) {
        const formatString = reader.uint16();
        const numElements = reader.byte();
        const elements = reader.list(numElements, () => {
            const phraseType = reader.byte();
            switch (phraseType) {
            case QuickChatContentType.Empty:
            case QuickChatContentType.Complex:
                break;
            case QuickChatContentType.Player:
                return QuickChatPlayerMessageData.Deserialize(reader);
            case QuickChatContentType.Simple:
                return QuickChatSimpleMessageData.Deserialize(reader);
            default:
                break;
            }
        });
        return new QuickChatComplexMessageData(formatString, elements);
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(this.formatString);
        writer.byte(this.elements.length);
        for (const element of this.elements) {
            if (element === undefined)
                continue;
            
            writer.byte(element.contentType);
            writer.write(element);
        }
    }

    clone() {
        return new QuickChatComplexMessageData(this.formatString, this.elements.map(elem => elem === undefined ? elem : elem.clone()));
    }
}

export type QuickChatMessageData =
    QuickChatPlayerMessageData |
    QuickChatSimpleMessageData |
    QuickChatComplexMessageData;

export class SendQuickChatMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SendQuickChat as const;
    messageTag = RpcMessageTag.SendQuickChat as const;

    constructor(
        public readonly message: QuickChatMessageData
    ) {
        super();
    }

    static Deserialize(reader: HazelReader) {
        const contentType = reader.uint8();

        switch (contentType) {
        case QuickChatContentType.Player:
            return new SendQuickChatMessage(QuickChatPlayerMessageData.Deserialize(reader));
        case QuickChatContentType.Simple:
            return new SendQuickChatMessage(QuickChatSimpleMessageData.Deserialize(reader));
        case QuickChatContentType.Complex:
            return new SendQuickChatMessage(QuickChatComplexMessageData.Deserialize(reader));
        default:
            return new SendQuickChatMessage(new QuickChatSimpleMessageData(StringNames.ANY));
        }
    }

    Serialize(writer: HazelWriter) {
        writer.uint8(this.message.contentType);
        writer.write(this.message);
    }

    clone() {
        return new SendQuickChatMessage(this.message.clone());
    }
}
