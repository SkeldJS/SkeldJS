const fs = require("fs");

const path = process.argv[2];
if (!path) {
    console.error("Missing file to dumped enum json file");
    process.exit(1);
}

const name = process.argv[3];
if (!name) {
    console.error("Mising dumped enum name");
    process.exit(1);
}

const contents = fs.readFileSync(path, "utf8");
const json = JSON.parse(contents);

let out = `export enum ${name} {\n`;

let lastValue = -1;
for (const [ key, val ] of Object.entries(json)) {
    out += `    ${key}`;
    if (val !== lastValue + 1) {
        out += ` = ${val}`;
    }
    lastValue = val;
    out += ",\n";
}

out += "};";

console.log(out);