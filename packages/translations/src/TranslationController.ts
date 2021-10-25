import { Hostable, Language, StringNames } from "@skeldjs/core";
import { QuickChatMessageData, QuickChatPhraseMessageData, QuickChatPlayerMessageData, QuickChatSentenceMessageData } from "@skeldjs/protocol";

import { AllTranslations } from "./translations";

export class TranslationController {
    constructor(public readonly room: Hostable) {}

    private getPlayerName(playerId: number) {
        const player = this.room.getPlayerByPlayerId(playerId);

        return player?.info?.name || "";
    }

    private getQuickchatTranslation(stringName: StringNames, language: Language) {
        const translation = AllTranslations[language][stringName] || AllTranslations[Language.English][stringName];

        if (typeof translation === "undefined") {
            return "";
        }

        return translation;
    }

    private formatString(str: string, elements: (number|QuickChatPlayerMessageData)[], language: Language) {
        return str.replace(/\{\d\}/g, x => {
            const elementI = parseInt(x[1]);
            const element = elements[elementI];

            if (!element) {
                return "";
            }

            if (typeof element === "number") {
                return this.getTranslation(element as StringNames, language);
            }

            return this.getPlayerName(element.playerId);
        });
    }

    getTranslation(stringName: StringNames, language: Language): string {
        const translation = AllTranslations[language][stringName] || AllTranslations[Language.English][stringName];

        if (typeof translation === "undefined") {
            return "";
        }

        if (typeof translation === "string") {
            return translation;
        }

        return translation[Object.keys(translation)[0]]; // if it's an object then just get the first one, doesn't really matter.
    }

    serializeQuickChat(quickChatMessage: QuickChatMessageData, language: Language): string {
        if (quickChatMessage instanceof QuickChatPlayerMessageData) {
            return this.getPlayerName(quickChatMessage.playerId);
        } else if (quickChatMessage instanceof QuickChatPhraseMessageData) {
            return this.getTranslation(quickChatMessage.formatString as StringNames, language);
        } else if (quickChatMessage instanceof QuickChatSentenceMessageData) {
            const formatTranslation = this.getQuickchatTranslation(quickChatMessage.formatString, language);

            if (typeof formatTranslation === "string") {
                return this.formatString(this.getTranslation(quickChatMessage.formatString, language), quickChatMessage.elements, language);
            }

            const elementTypes = [];
            for (const element of quickChatMessage.elements) {
                if (element === StringNames.QCCrewNoOne) {
                    elementTypes.push("QCCrewNoOne");
                } else if (element === StringNames.QCCrewMe || element === StringNames.QCCrewI) {
                    elementTypes.push("QCCrewMe");
                } else {
                    elementTypes.push("ANY");
                }
            }

            const keyByElements = elementTypes.join("_");

            const translationByElements = formatTranslation[keyByElements] || formatTranslation[Object.keys(formatTranslation)[0]];

            if (!translationByElements)
                return "";

            return this.formatString(translationByElements, quickChatMessage.elements, language);
        }

        return "";
    }
}
