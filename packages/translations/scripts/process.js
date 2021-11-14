const { Language, StringNames } = require("@skeldjs/constant");
const fs = require("fs/promises");
const path = require("path");

const nameToLanguageId = {
    "English": Language.English,
    "Espa\u00F1ol (Latinoam\u00E9rica)": Language.SpanishAmericas,
    "Portugu\u00EAs (Brasil)": Language.PortugueseBrazil,
    "Portugu\u00EAs": Language.Portuguese,
    "\uD55C\uAD6D\uC5B4": Language.Korean,
    "\u0420\u0443\u0441\u0441\u043A\u0438\u0439": Language.Russian,
    "Nederlands": Language.Dutch,
    "Bisaya": Language.Filipino,
    "Fran\u00E7ais": Language.French,
    "Deutsch": Language.German,
    "Italiano": Language.Italian,
    "\u65E5\u672C\u8A9E": Language.Japanese,
    "Espa\u00F1ol": Language.Spanish,
    "\u7B80\u4F53\u4E2D\u6587": Language.ChineseTraditional,
    "\u7E41\u9AD4\u4E2D\u6587": Language.ChineseSimplified,
    "Gaeilge": Language.Irish
};

function escape(translationStr) {
    return translationStr.replace(/"/g, "\\\"");
}

(async () => {
    const TAB = "    ";
    const translations = JSON.parse(await fs.readFile(path.resolve(__dirname, "./translations.json"), "utf8"));

    const processedTranslations = {};

    let outputText = `import { Language, StringNames } from "@skeldjs/constant";

export const AllTranslations: Record<Language, Partial<Record<StringNames|string, string|Record<string, string>>>> = {
`;

    for (const langugeName in translations) {
        const languageId = nameToLanguageId[langugeName];

        if (languageId === undefined) {
            console.error("No language id found for: %s", langugeName);
            return;
        }

        console.log("Processing %s..", langugeName);

        const translationMap = {};
        processedTranslations[Language[languageId]] = translationMap;

        const stringNamePaths = Object.keys(translations[langugeName]);
        for (let i = 0; i < stringNamePaths.length; i++) {
            const stringNamePath = stringNamePaths[i];
            if (!stringNamePath)
                continue;

            const [ stringName, ...path ] = stringNamePath.split(/[_\.]/);

            if (path.length) {
                if (typeof translationMap[stringName] === "object") {
                    translationMap[stringName][path.join("_")] = escape(translations[langugeName][stringNamePath]);
                } else {
                    translationMap[stringName] = {
                        default: translationMap[stringName],
                        [path.join("_")]: escape(translations[langugeName][stringNamePath])
                    };
                }
            } else {
                if (translationMap[stringName]) {
                    if (typeof translationMap[stringName] === "object") {
                        translationMap[stringName]["default"] = escape(translations[langugeName][stringNamePath]);
                    } else {
                        translationMap[stringName] = escape(translations[langugeName][stringNamePath]);
                    }
                } else {
                    translationMap[stringName] = escape(translations[langugeName][stringNamePath]);
                }
            }
        }
    }

    for (const languageName in processedTranslations) {
        console.log("Writing %s..", languageName);

        outputText += `${TAB}[Language.${languageName}]: {\n`;

        for (const stringName in processedTranslations[languageName]) {
            const stringText = processedTranslations[languageName][stringName];

            const stringCodeName = StringNames[stringName]
                ? "[StringNames." + stringName + "]"
                : "\"" + stringName + "\"";

            if (typeof stringText === "string") {
                outputText += `${TAB}${TAB}${stringCodeName}: "${stringText.trim()}",\n`;
            } else {
                outputText += `${TAB}${TAB}${stringCodeName}: {\n`;

                for (const pathName in processedTranslations[languageName][stringName]) {
                    outputText += `${TAB}${TAB}${TAB}"${pathName}": "${processedTranslations[languageName][stringName][pathName]?.trim()}",\n`;
                }

                outputText = outputText.substr(0, outputText.length - 2); // remove ending ,
                outputText += `\n${TAB}${TAB}},\n`;
            }
        }

        outputText = outputText.substr(0, outputText.length - 2); // remove ending ,
        outputText += `\n${TAB}},\n`;
    }

    outputText = outputText.substr(0, outputText.length - 2); // remove ending ,
    outputText += "\n};";

    await fs.writeFile(path.resolve(__dirname, "translations.ts"), outputText, "utf8");
})();
