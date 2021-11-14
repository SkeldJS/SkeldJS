const fs = require("fs/promises");
const path = require("path");

const TAB = "    ";

/**
 * @param {String[]} items
 */
function createEnum(items) {
    const defined = new Set;
    let out = "{";
    for (let i = 0; i < items.length; i++) {
        if (i !== 0) {
            out += ",";
        }
        const parts = items[i].split(/[_-]/g);
        if (parts[0] === "hat" || parts[0] === "pet" || parts[0] === "skin" || parts[0] === "nameplate" || parts[0] === "visor") {
            parts.shift();
        }
        while (parts[0].startsWith("pk")) {
            parts.shift();
        }
        const pascalCase = parts.map(part => part[0].toUpperCase() + part.substr(1)).join("");
        let codeFriendlyName = pascalCase;
        let j = 2;
        while (defined.has(codeFriendlyName)) {
            codeFriendlyName = pascalCase + j;
            j++;
        }
        out += `\n${TAB}${codeFriendlyName} = "${items[i]}"`;
        defined.add(pascalCase);
    }
    out += "\n}";
    return out;
}

(async () => {
    const cosmeticsFileData = await fs.readFile(path.resolve(__dirname, "./cosmetics.json"), "utf8");
    const cosmeticsJson = JSON.parse(cosmeticsFileData);

    const allHats = [];
    const allPets = [];
    const allSkins = [];
    const allNameplates = [];
    const allVisors = [];

    for (const cosmetic of cosmeticsJson) {
        if (cosmetic.type === "Hat") {
            allHats.push(cosmetic.name);
        } else if (cosmetic.type === "Pet") {
            allPets.push(cosmetic.name);
        } else if (cosmetic.type === "Skin") {
            allSkins.push(cosmetic.name);
        } else if (cosmetic.type === "Nameplate") {
            allNameplates.push(cosmetic.name);
        } else if (cosmetic.type === "Visor") {
            allVisors.push(cosmetic.name);
        }
    }

    try {
        await fs.mkdir(path.resolve(__dirname, "enums"));
    } catch (e) {}

    await fs.writeFile(path.resolve(__dirname, "./enums/Hat.ts"), "export enum Hat " + createEnum(allHats), "utf8");
    await fs.writeFile(path.resolve(__dirname, "./enums/Pet.ts"), "export enum Pet " + createEnum(allPets), "utf8");
    await fs.writeFile(path.resolve(__dirname, "./enums/Skin.ts"), "export enum Skin " + createEnum(allSkins), "utf8");
    await fs.writeFile(path.resolve(__dirname, "./enums/Nameplate.ts"), "export enum Nameplate " + createEnum(allNameplates), "utf8");
    await fs.writeFile(path.resolve(__dirname, "./enums/Visor.ts"), "export enum Visor " + createEnum(allVisors), "utf8");
})();
