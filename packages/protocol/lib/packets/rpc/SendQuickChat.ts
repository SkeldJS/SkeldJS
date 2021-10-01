import { RpcMessageTag, StringNames } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export enum QuickChatContentType {
    Sentence,
    Phrase,
    Player
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

export class QuickChatPhraseMessageData extends BaseQuickChatMessageData {
    constructor(
        public readonly formatString: number
    ) {
        super(QuickChatContentType.Phrase);
    }

    static Deserialize(reader: HazelReader) {
        return new QuickChatPhraseMessageData(reader.uint16());
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(this.formatString);
    }

    clone() {
        return new QuickChatPhraseMessageData(this.formatString);
    }
}

export class QuickChatSentenceMessageData extends BaseQuickChatMessageData {
    constructor(
        public readonly formatString: number,
        public readonly elements: (QuickChatPlayerMessageData|number)[]
    ) {
        super(QuickChatContentType.Sentence);
    }

    static Deserialize(reader: HazelReader) {
        const elements = reader.list(() => {
            const stringId = reader.uint16();
            if (stringId === StringNames.ANY) {
                return QuickChatPlayerMessageData.Deserialize(reader);
            }

            return stringId;
        });
        const formatString = reader.uint16();
        return new QuickChatSentenceMessageData(formatString, elements);
    }

    Serialize(writer: HazelWriter) {
        writer.list(true, this.elements, item => {
            if (typeof item === "number") {
                writer.uint16(item);
                return;
            }
            writer.uint16(StringNames.ANY);
            writer.uint8(item.playerId);
        });
        writer.uint16(this.formatString);
    }

    clone() {
        return new QuickChatSentenceMessageData(this.formatString, this.elements.map(elem => typeof elem === "number" ? elem : elem.clone()));
    }
}

export type QuickChatMessageData =
    QuickChatPlayerMessageData |
    QuickChatPhraseMessageData |
    QuickChatSentenceMessageData;

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
        case QuickChatContentType.Sentence:
            return new SendQuickChatMessage(QuickChatSentenceMessageData.Deserialize(reader));
        case QuickChatContentType.Player:
            return new SendQuickChatMessage(QuickChatPlayerMessageData.Deserialize(reader));
        case QuickChatContentType.Phrase:
            return new SendQuickChatMessage(QuickChatPhraseMessageData.Deserialize(reader));
        default:
            return new SendQuickChatMessage(new QuickChatPhraseMessageData(StringNames.ANY));
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
