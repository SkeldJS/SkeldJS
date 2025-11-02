const { Language, StringName } = require("@skeldjs/au-constants");
const fs = require("fs");
const path = require("path");

const translationsPath = process.argv[2];

if (!translationsPath) {
    console.error("Missing base path for translation data");
    process.exit(1);
}

function escape(translationStr) {
    return translationStr.replace(/"/g, "\\\"").replace(/\n/g, "\\n");
}

const TAB = "    ";
const translationsJson = JSON.parse(fs.readFileSync(translationsPath, "utf8"));

const processedTranslations = {};

let outputText = `import { Language, StringName } from "@skeldjs/au-constants";

export const allTranslations: Record<Language, Partial<Record<StringName|string, string|Record<string, string>>>> = {
`;

for (const langugeName in translationsJson) {
    const languageId = langugeName;

    if (languageId === undefined) {
        console.error("No language id found for: %s", langugeName);
        return;
    }

    console.log("Processing %s..", langugeName);

    const translationMap = {};
    processedTranslations[languageId] = translationMap;

    const stringNamePaths = Object.keys(translationsJson[langugeName]);
    for (let i = 0; i < stringNamePaths.length; i++) {
        const stringNamePath = stringNamePaths[i];
        if (!stringNamePath)
            continue;

        const [ stringName, ...path ] = stringNamePath.split(/[_\.]/);

        if (path.length) {
            if (typeof translationMap[stringName] === "object") {
                translationMap[stringName][path.join("_")] = escape(translationsJson[langugeName][stringNamePath]);
            } else {
                translationMap[stringName] = {
                    default: translationMap[stringName],
                    [path.join("_")]: escape(translationsJson[langugeName][stringNamePath])
                };
            }
        } else {
            if (translationMap[stringName]) {
                if (typeof translationMap[stringName] === "object") {
                    translationMap[stringName]["default"] = escape(translationsJson[langugeName][stringNamePath]);
                } else {
                    translationMap[stringName] = escape(translationsJson[langugeName][stringNamePath]);
                }
            } else {
                translationMap[stringName] = escape(translationsJson[langugeName][stringNamePath]);
            }
        }
    }
}

for (const languageName in processedTranslations) {
    console.log("Writing %s..", languageName);

    outputText += `${TAB}[Language.${languageName}]: {\n`;

    for (const stringName in processedTranslations[languageName]) {
        const stringText = processedTranslations[languageName][stringName];

        const stringCodeName = StringName[stringName]
            ? "[StringName." + stringName + "]"
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

fs.writeFileSync(path.resolve(__dirname, "translations.ts"), outputText, "utf8");
