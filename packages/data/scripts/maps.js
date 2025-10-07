const fs = require("fs");
const path = require("path");

const t = "    ";

const amongus = require("@skeldjs/constant");

const dumpostorOutputPath = process.argv[2];

const mapNamesToId = {
    "Skeld": "TheSkeld",
    "April": "AprilFoolsTheSkeld",
    "Mira": "MiraHQ",
    "Polus": "Polus",
    "Airship": "Airship",
    "Fungle": "TheFungle",
};

if (!dumpostorOutputPath) {
    console.log("Expected argument {0} to be the output location of a Dumpostor dump");
    return;
}

let filesInDirectory;
try {
    filesInDirectory = fs.readdirSync(dumpostorOutputPath);
} catch (e) {
    if (e.code === "ENOEXIST") {
        console.log("Specified dumpostor output path does not exist.");
        return;
    }

    console.log("Could not open dumpostor output path (" + e.code + ")");
    return;
}

const mapDataFolders = [];
for (const fileName of filesInDirectory) {
    const resolveFileName = path.resolve(dumpostorOutputPath, fileName);

    const stat = fs.statSync(resolveFileName);

    if (stat.isDirectory()) {
        const filesInDirectory = fs.readdirSync(resolveFileName);
        if (!filesInDirectory.includes("tasks.json") || !filesInDirectory.includes("vents.json")) {
            continue;
        }

        mapDataFolders.push(resolveFileName);
    }
}

try {
    fs.mkdirSync(path.resolve(__dirname, "maps"), { recursive: true });
} catch (e) {}

for (const mapDataFolder of mapDataFolders) {
    const taskFileName = path.resolve(mapDataFolder, "tasks.json");
    const ventFileName = path.resolve(mapDataFolder, "vents.json");

    const taskFileData = fs.readFileSync(taskFileName, "utf8");
    const ventFileData = fs.readFileSync(ventFileName, "utf8");

    const taskFileJson = JSON.parse(taskFileData);
    const ventFileJson = JSON.parse(ventFileData);

    const mapName = mapNamesToId[path.basename(mapDataFolder)];

    const taskEntries = Object.entries(taskFileJson);
    let taskOutput = `/*
    Generated using https://github.com/skeldjs/SkeldJS/tree/master/packages/data/scripts/maps.js
    Data dumped from https://github.com/Impostor/Dumpostor

    Copyright (C) 2025 Edward Smale

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { TaskLength, TaskType } from "@skeldjs/constant";
import { TaskInfo } from "../types";

export const ${mapName}Tasks: Record<number, TaskInfo> = {
`;
    for (const [ taskId, taskInfo ] of taskEntries) {
        taskOutput += `${t}${taskId}: {
${t}${t}id: ${taskId},
${t}${t}taskType: TaskType.${taskInfo.taskType},
${t}${t}length: TaskLength.${taskInfo.length},
${t}${t}consoles: [
`;
        for (let i = 0; i < taskInfo.consoles.length; i++) {
            const consoleInfo = taskInfo.consoles[i];
            taskOutput += `${t}${t}${t}{
${t}${t}${t}${t}index: ${consoleInfo.id},
${t}${t}${t}${t}usableDistance: ${consoleInfo.usableDistance},
${t}${t}${t}${t}position: {
${t}${t}${t}${t}${t}x: ${consoleInfo.position.x},
${t}${t}${t}${t}${t}y: ${consoleInfo.position.y}
${t}${t}${t}${t}}
${t}${t}${t}}${i === taskInfo.consoles.length - 1 ? "" : ","}`;
        }

        taskOutput += `
${t}${t}]
${t}}${taskId === taskEntries[taskEntries.length - 1][0] ? "" : ","}
`;
    }

    taskOutput += "};";

    fs.writeFileSync(path.resolve(__dirname, "maps", mapName + "Tasks.ts"), taskOutput, "utf8");

    const ventEntries = Object.entries(ventFileJson);
    let ventOutput = `/*
    Generated using https://github.com/skeldjs/SkeldJS/tree/master/packages/data/scripts/maps.js
    Data dumped from https://github.com/Impostor/Dumpostor

    Copyright (C) 2025 Edward Smale

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { ${mapName}Vent } from "@skeldjs/constant";
import { VentInfo } from "../types";

export const ${mapName}Vents: Record<number, VentInfo> = {
`;
    for (const [ ventId, ventInfo ] of ventEntries) {
        const ventMapConstants = amongus[mapName + "Vent"];
        const ventName = ventMapConstants[ventId];

        ventOutput += `${t}[${mapName}Vent.${ventName}]: {
${t}${t}id: ${mapName}Vent.${ventName},
${t}${t}position: {
${t}${t}${t}x: ${ventInfo.position.x},
${t}${t}${t}y: ${ventInfo.position.y}
${t}${t}},
${t}${t}network: [`;

        const network = [];
        if (ventInfo.left) network.push(ventInfo.left);
        if (ventInfo.center) network.push(ventInfo.center);
        if (ventInfo.right) network.push(ventInfo.right);

        ventOutput += network.map(ventId => {
            const ventName = ventMapConstants[ventId];
            return `${mapName}Vent.${ventName}`;
        }).join(", ") + "]\n";

        ventOutput += `${t}}${ventId === ventEntries[ventEntries.length - 1][0] ? "" : ","}
`;
    }
    ventOutput += "};";

    fs.writeFileSync(path.resolve(__dirname, "maps", mapName + "Vents.ts"), ventOutput, "utf8");
}
