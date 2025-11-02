const fs = require("fs");
const path = require("path");

const cosmeticsPath = process.argv[2];
if (!cosmeticsPath) {
    console.error("Missing file to dumped mixup.json");
    process.exit(1);
}

const contents = fs.readFileSync(cosmeticsPath);
const json = JSON.parse(contents);

function generateArray(cosmeticIds, enumName) {
    let out = "";
    for (let i = 0; i < cosmeticIds.length; i++) {
        const hat = cosmeticIds[i];
        const parts = hat.split(/[_\-]/g);
        parts.shift();

        const pascalCase = parts.map(x => x[0].toUpperCase() + x.substring(1)).join("");

        out += `
    ${enumName}.${pascalCase},
`.replace("\n", "");
    }
    return out;
}

let out = `
import { Hat, Pet, Visor } from "./cosmetics";

export const mushroomMixupHats: Hat[] = [
${generateArray(json.hatIds, "Hat")}];

export const mushroomMixupPets: Pet[] = [
${generateArray(json.petIds, "Pet")}];

export const mushroomMixupVisors: Visor[] = [
${generateArray(json.visorIds, "Visor")}];`

console.log(out);