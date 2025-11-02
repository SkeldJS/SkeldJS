const fs = require("fs");
const path = require("path");

const mapsBasePath = process.argv[2];

if (!mapsBasePath) {
    console.error("Missing base path for maps");
    process.exit(1);
}

const mapNames = [
    { dumpostor: "Skeld", skeldjs: "TheSkeld" },
    { dumpostor: "Mira", skeldjs: "MiraHQ" },
    { dumpostor: "Polus", skeldjs: "Polus" },
    { dumpostor: "April", skeldjs: "AprilFoolsTheSkeld" },
    { dumpostor: "Airship", skeldjs: "Airship" },
    { dumpostor: "Fungle", skeldjs: "Fungle" },
];

function dumpDoors() {
    let out = `
import { GameMap } from "../../enums";
import { SystemType } from "../SystemType";

export type DoorData = {
    associatedZone: SystemType;
    position: { x: number; y: number; };
};

export const mapDoorsData: Record<GameMap, DoorData[]> = {
`.replace("\n", "");

    for (const { dumpostor: dumpostorName, skeldjs: skeldjsName } of mapNames) {
        const doorsData = JSON.parse(fs.readFileSync(path.join(mapsBasePath, dumpostorName, "doors.json"), "utf8"));

        out += `
    [GameMap.${skeldjsName}]: [
`.replace("\n", "");

        const doorArr = [];
        for (const [ doorId, doorData ] of Object.entries(doorsData)) {
            doorArr[parseInt(doorId)] = doorData;
        }

        for (const doorData of doorArr) {
            out += `
        {
            associatedZone: SystemType.${doorData.room},
            position: { x: ${doorData.position.x}, y: ${doorData.position.y} },    
        },
`.replace("\n", "");
        }

        out += `
    ],
`.replace("\n", "");
    }

    out += `
};`.replace("\n", "");

    return out;
}

function dumpTasks() {
    let out = `
import { GameMap } from "../../enums";
import { SystemType } from "../SystemType";
import { TaskType } from "../TaskType";

export type TaskConsoleData = {
    id: number;
    associatedZone: SystemType;
    position: { x: number; y: number; };
    usableDistance: number;
};

export type TaskData = {
    type: TaskType,
    length: "Common"|"Long"|"Short";
    consoles: TaskConsoleData[];
};

export const mapTasksData: Record<GameMap, TaskData[]> = {
`.replace("\n", "");

    for (const { dumpostor: dumpostorName, skeldjs: skeldjsName } of mapNames) {
        const tasksData = JSON.parse(fs.readFileSync(path.join(mapsBasePath, dumpostorName, "tasks.json"), "utf8"));

        out += `
    [GameMap.${skeldjsName}]: [
`.replace("\n", "");

        const taskArr = [];
        for (const [ taskId, taskData ] of Object.entries(tasksData)) {
            taskArr[parseInt(taskId)] = taskData;
        }

        for (const taskData of taskArr) {
            out += `
        {
            type: TaskType.${taskData.taskType},
            length: "${taskData.length}",
            consoles: [
`.replace("\n", "");

            for (const consoleData of taskData.consoles) {
                out += `
                {
                    id: ${consoleData.id},
                    associatedZone: SystemType.${consoleData.room},
                    position: { x: ${consoleData.position.x}, y: ${consoleData.position.y} },
                    usableDistance: ${consoleData.usableDistance},
                },
`.replace("\n", "");
            }

out += `
            ],
        },
`.replace("\n", "");
        }

        out += `
    ],
`.replace("\n", "");
    }

    out += `
};`.replace("\n", "");

    return out;
}

function dumpVents() {
    let out = `
import { GameMap } from "../../enums";

export type VentData = {
    name: string;
    position: { x: number; y: number; };
    movements: {
        left: number|null;
        center: number|null;
        right: number|null;
    };
};

export const mapVentsData: Record<GameMap, (VentData|null)[]> = {
`.replace("\n", "");

    for (const { dumpostor: dumpostorName, skeldjs: skeldjsName } of mapNames) {
        const ventsData = JSON.parse(fs.readFileSync(path.join(mapsBasePath, dumpostorName, "vents.json"), "utf8"));

        out += `
    [GameMap.${skeldjsName}]: [
`.replace("\n", "");

        const ventArr = [];
        for (const [ ventId, ventData ] of Object.entries(ventsData)) {
            ventArr[parseInt(ventId)] = ventData;
        }

        for (const ventData of ventArr) {
            if (!ventData) {
                out += `
        null,
`.replace("\n", "");
                continue;
            }

            out += `
        {
            name: "${ventData.name}",
            position: { x: ${ventData.position.x}, y: ${ventData.position.y} },
            movements: {
                left: ${ventData.left},
                center: ${ventData.center},
                right: ${ventData.right},
            }
        },
`.replace("\n", "");
        }

        out += `
    ],
`.replace("\n", "");
    }

    out += `
};`.replace("\n", "");

    return out;
}

fs.mkdirSync("maps", { recursive: true });

fs.writeFileSync(path.join("maps", "mapDoorsData.ts"), dumpDoors(), "utf8");
fs.writeFileSync(path.join("maps", "mapTasksData.ts"), dumpTasks(), "utf8");
fs.writeFileSync(path.join("maps", "mapVentData.ts"), dumpVents(), "utf8");