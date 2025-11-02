const fs = require("fs");
const path = require("path");

const TAB = "    ";

const cosmeticsPath = process.argv[2];
if (!cosmeticsPath) {
    console.error("Missing file to dumped cosmetics.json");
    process.exit(1);
}

/**
 * @param {String[]} items
 */
function createEnum(items) {
    let out = "{";
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const parts = item.split(/[_\-]/g);
        parts.shift();

        const pascalCase = parts.map(x => x[0].toUpperCase() + x.substring(1)).join("");

        out += `\n${TAB}${pascalCase} = "${item}"`;
        out += ",";
    }
    out += "\n}";
    return out;
}

const contents = fs.readFileSync(cosmeticsPath, "utf8");
const json = JSON.parse(contents);

const allHats = [];
const allPets = [];
const allSkins = [];
const allNameplates = [];
const allVisors = [];

for (const cosmetic of json) {
    if (cosmetic.Type === "Hat") {
        allHats.push(cosmetic.Name);
    } else if (cosmetic.Type === "Pet") {
        allPets.push(cosmetic.Name);
    } else if (cosmetic.Type === "Skin") {
        allSkins.push(cosmetic.Name);
    } else if (cosmetic.Type === "Nameplate") {
        allNameplates.push(cosmetic.Name);
    } else if (cosmetic.Type === "Visor") {
        allVisors.push(cosmetic.Name);
    }
}

try {
    fs.mkdirSync(path.resolve(__dirname, "cosmetics"));
} catch (e) {}

fs.writeFileSync(path.resolve(__dirname, "./cosmetics/Hat.ts"), "export enum Hat " + createEnum(allHats), "utf8");
fs.writeFileSync(path.resolve(__dirname, "./cosmetics/Pet.ts"), "export enum Pet " + createEnum(allPets), "utf8");
fs.writeFileSync(path.resolve(__dirname, "./cosmetics/Skin.ts"), "export enum Skin " + createEnum(allSkins), "utf8");
fs.writeFileSync(path.resolve(__dirname, "./cosmetics/Nameplate.ts"), "export enum Nameplate " + createEnum(allNameplates), "utf8");
fs.writeFileSync(path.resolve(__dirname, "./cosmetics/Visor.ts"), "export enum Visor " + createEnum(allVisors), "utf8");