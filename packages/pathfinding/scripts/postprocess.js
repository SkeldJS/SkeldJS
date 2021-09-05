const fs = require("fs");
const path = require("path");

/**
 * @typedef Collider
 * @property {String} name
 * @property {String} path
 */

/**
 * @typedef Layer
 * @property {String} name
 * @property {Collider[]} colliders
 */

/**
 * @typedef {{ [key: string]: Layer }} LayersData
 */

/**
 * @typedef CollidersData
 * @property {LayersData} layers
 */

/**
 * @typedef CollidersJson
 * @property {CollidersData} colliders
 */

/**
 * @param {Number} layer_id
 */
function do_include_layer(layer_id) {
    return layer_id !== 0 &&
        layer_id !== 2;
}

const colors = {
    0: "yellow",
    2: "purple",
    9: "red",
    10: "black",
    11: "green",
    12: "blue"
};

const allow = [
    "Airship(Clone)/Electrical/Shadows"
];

const all_delete = [
    "MiraShip(Clone)/LaunchPad",
    "MiraShip(Clone)/Office",
    "MiraShip(Clone)/Garden",
    "MiraShip(Clone)/WoodHall",
    "MiraShip(Clone)/Outside",
    "MiraShip(Clone)/CarpetHall",
    "MiraShip(Clone)/Cafe",
    "MiraShip(Clone)/SkyBridge",
    "MiraShip(Clone)/Locker",
    "MiraShip(Clone)/SkyCarpetHall",
    "MiraShip(Clone)/Admin",
    "MiraShip(Clone)/Storage",
    "MiraShip(Clone)/Decontam",
    "MiraShip(Clone)/LabHall/Footsteps",
    "MiraShip(Clone)/Laboratory",
    "MiraShip(Clone)/Reactor",
    "PolusShip(Clone)/Dropship",
    "PolusShip(Clone)/Science",
    "PolusShip(Clone)/Electrical/Sounds/Tile",
    "PolusShip(Clone)/LifeSupport",
    "PolusShip(Clone)/Office",
    "PolusShip(Clone)/RightTube",
    "PolusShip(Clone)/Admin",
    "PolusShip(Clone)/LowerDecon",
    "PolusShip(Clone)/UpperDecon",
    "PolusShip(Clone)/Weapons",
    "PolusShip(Clone)/Electrical",
    "PolusShip(Clone)/RightTubeTop",
    "PolusShip(Clone)/LifeSupport/BoilerRoom",
    "PolusShip(Clone)/LifeSupport/Drip",
    "PolusShip(Clone)/LifeSupport/Drip (1)",
    "PolusShip(Clone)/Storage",
    "PolusShip(Clone)/Comms",
    "PolusShip(Clone)/Security",
    "Airship(Clone)/Engine",
    "Airship(Clone)/HallwayMain",
    "Airship(Clone)/Showers",
    "Airship(Clone)/Security",
    "Airship(Clone)/Brig",
    "Airship(Clone)/Comms",
    "Airship(Clone)/Armory/SFX/woodstep",
    "Airship(Clone)/Cockpit",
    "Airship(Clone)/Armory",
    "Airship(Clone)/Ejection",
    "Airship(Clone)/Kitchen",
    "Airship(Clone)/HallwayPortrait",
    "Airship(Clone)/Electrical",
    "Airship(Clone)/Medbay",    
    "Airship(Clone)/Ventilation",
    "Airship(Clone)/Storage",
    "Airship(Clone)/Lounge",
    "Airship(Clone)/Records",
    "Airship(Clone)/GapRoom",
    "Airship(Clone)/Medbay",
    "Airship(Clone)/HallwayL",
    "Airship(Clone)/MeetingRoom",
    "Airship(Clone)/Vault/vault_goldtop",
    "Airship(Clone)/HallwayMain/Darkroom"
];

/**
 * @param {Collider} collider
 */
function do_include_collider(collider) {
    if (allow.includes(collider.name))
        return true;

    if (all_delete.includes(collider.name) && collider.path.endsWith("Z"))
        return false;

    if (collider.name === "Airship(Clone)/Vault" || collider.name === "Airship(Clone)/Vault/vault_goldtop")
        return false;

    if (collider.name.includes("OneWay") && collider.path.endsWith("Z"))
        return false;

    if (collider.name.includes("Shadow"))
        return false;

    if (collider.name.includes("Console") || collider.name.endsWith("Scanner") || collider.name.includes("Panel") || collider.name.includes("panel_"))
        return false;

    if (collider.name.endsWith("/Room"))
        return false;

    if (collider.name.toLowerCase().includes("door") || collider.name.includes("Logger") || collider.name.includes("Vert") || collider.name.includes("DeconDoor") || collider.name.includes("Hort"))
        return false;

    if (collider.name.includes("Task") || collider.name.includes("task_") || collider.name.includes("taks_"))
        return false;

    if (/Vent\d?$/.test(collider.name) || collider.name.includes("Platform") || collider.name.includes("Ladder") || collider.name.includes("Divert"))
        return false;

    if (collider.name.includes("Sounds") || collider.name.toLowerCase().includes("sfx"))
        return false;

    return true;
}

function compile_collider(filename) {
    let svg_out = "";
    
    // boilerplate
    svg_out += `<svg version="1.1" baseProfile="full" viewBox="-45 -30 90 60" xmlns="http://www.w3.org/2000/svg">\n`;
    svg_out += `<defs>
    <style type="text/css"><![CDATA[
    path:hover {
       stroke: red;
    }
    ]]></style>
    </defs>`;
    svg_out += `<g transform="scale(1, -1)">\n`;

    const input_data = fs.readFileSync(filename, "utf8");

    /**
     * @type {CollidersJson}
     */
    const input_json = JSON.parse(input_data);
    const lines = [];

    for (const key of Object.keys(input_json.colliders.layers)) {
        const layer_id = parseInt(key);
        const layer = input_json.colliders.layers[layer_id];
    
        if (!do_include_layer(layer_id))
            continue;
    
        for (const collider of layer.colliders) {
            if (!do_include_collider(collider)) {
                svg_out += `<!-- Skipped ${collider.name} -->`;
                continue;
            }
    
            svg_out += `<!-- ${collider.name} -->\n`;
            svg_out += `<path d="${collider.path}" stroke="${colors[layer_id]}" fill="transparent" stroke-width="0.1" />\n`;

            let out = "";
            const points = collider.path.match(/-?\d+(\.\d+)?, ?-?\d+(\.\d+)?/g);
    
            out += points.map(pt => "(" + pt + ")").join(" ");
    
            if (collider.path.endsWith("Z")) {
                out += " (" + points[0] + ")";
            }
    
            lines.push(out);
        }
    }

    svg_out += `</g>`;
    svg_out += `</svg>`;
    
    fs.writeFileSync(path.resolve(__dirname, "./" + path.basename(filename).split(".")[0] + ".svg"), svg_out, "utf8");

    const out = lines.join("\n");
    fs.writeFileSync(path.resolve(__dirname, "./" + path.basename(filename).split(".")[0] + ".txt"), out, "utf8");
}

const pathname = path.resolve(__dirname, ".");
const filenames = fs.readdirSync(pathname);

for (const filename of filenames) {
    if (filename.endsWith(".json")) {
		try {
			compile_collider(path.resolve(pathname, filename));
		} catch (e) {
			
		}
    }
}