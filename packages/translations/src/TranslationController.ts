import {
    Hostable,
    Language,
    PlayerData,
    StringNames
} from "@skeldjs/core";

import {
    QuickChatComplexMessageData,
    QuickChatMessageData,
    QuickChatPlayerMessageData,
    QuickChatSimpleMessageData
} from "@skeldjs/protocol";

import { AllTranslations } from "./translations";

/**
 * Represents a controller for a room to handle translations.
 */
export class TranslationController {
    /**
     * Create a translation controller, optionally passing in a room to connect
     * it with player names for quick chat messages.
     * @param room The room to connect the translation controller to.
     */
    constructor(public readonly room?: Hostable) {}

    private getPlayerName(playerId: number) {
        return this.room?.getPlayerByPlayerId(playerId)?.playerInfo?.defaultOutfit.name || "";
    }

    private getQuickchatTranslation(stringName: StringNames, language: Language) {
        const translation = AllTranslations[language][stringName] || AllTranslations[Language.English][stringName];

        if (typeof translation === "undefined") {
            return "";
        }

        return translation;
    }

    /**
     * Format a translation string containing {X} templating. Also substitutes
     * player names if the translation controller is connected to a room in the
     * constructor.
     * @param str The string to format against.
     * @param elements The elements to format the string with.
     * @param language The language of the string.
     * @returns The formatted string.
     */
    formatString(str: string|StringNames, elements: (undefined|number|QuickChatSimpleMessageData|QuickChatPlayerMessageData|PlayerData)[], language: Language) {
        const translationString = typeof str === "string"
            ? str
            : this.getTranslation(str, language);

        return translationString.replace(/\{\d\}/g, x => {
            const elementI = parseInt(x[1]);
            const element = elements[elementI];

            if (!element) {
                return "";
            }

            if (element instanceof QuickChatSimpleMessageData) {
                return this.getTranslation(element.formatString, language);
            }

            if (typeof element === "number") {
                return this.getTranslation(element as StringNames, language);
            }

            if (element instanceof PlayerData) {
                return element.playerInfo?.defaultOutfit.name || "";
            }

            return this.getPlayerName(element.playerId);
        });
    }

    /**
     * Get the single translation of a string.
     * @param stringName The string name to get.
     * @param language The language to translate the string name to.
     * @returns The translated string, or an empty string if an invalid string
     * name was passed.
     */
    getTranslation(stringName: StringNames, language: Language): string {
        const translation = AllTranslations[language][stringName] || AllTranslations[Language.English][stringName];

        if (typeof translation === "undefined") {
            return "";
        }

        if (typeof translation === "string") {
            return translation;
        }

        return translation["default"] || translation[Object.keys(translation)[0]]; // if it's an object then just get the first one, doesn't really matter.
    }

    /**
     * Synthesise a quick chat message into a single string, considering translations
     * and player names.
     * @param quickChatMessage The message to synthesise.
     * @param language The language to synthesise the message into.
     * @returns The synthesised message.
     */
    serializeQuickChat(quickChatMessage: QuickChatMessageData, language: Language): string {
        if (quickChatMessage instanceof QuickChatPlayerMessageData) {
            return this.getPlayerName(quickChatMessage.playerId);
        } else if (quickChatMessage instanceof QuickChatSimpleMessageData) {
            return this.getTranslation(quickChatMessage.formatString as StringNames, language);
        } else if (quickChatMessage instanceof QuickChatComplexMessageData) {
            const formatTranslation = this.getQuickchatTranslation(quickChatMessage.formatString, language);

            if (typeof formatTranslation === "string") {
                return this.formatString(quickChatMessage.formatString, quickChatMessage.elements, language);
            }

            const elementTypes = [];
            for (const element of quickChatMessage.elements) {
                if (element instanceof QuickChatSimpleMessageData) {
                    if (element.formatString === StringNames.QCCrewNoOne) {
                        elementTypes.push("QCCrewNoOne");
                    } else if (element.formatString === StringNames.QCCrewMe || element.formatString === StringNames.QCCrewI) {
                        elementTypes.push("QCCrewMe");
                    } else {
                        elementTypes.push("ANY");
                    }
                }
            }

            const keyByElements = elementTypes.join("_");

            const translationByElements = formatTranslation[keyByElements]
                ?? formatTranslation["default"]
                ?? formatTranslation[Object.keys(formatTranslation)[0]];

            if (!translationByElements)
                return "";

            return this.formatString(translationByElements, quickChatMessage.elements, language);
        }

        return "";
    }

    /**
     * Get the translation string of a cosmetic.
     * @param cosmeticId The ID of the cosmetic to get the name of.
     * @param language The language to translate the cosmetic name into.
     * @returns The cosmetic name as translated into the given language.
     */
    getCosmeticName(cosmeticId: string, language: Language) {
        const cosmeticTranslations = AllTranslations[language]["Cosmetic"] as Record<string, string>;
        return cosmeticTranslations[cosmeticId];
    }
}
