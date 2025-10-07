import { TaskLength, TaskType } from "@skeldjs/constant";

export interface TaskConsoleInfo {
    index: number;
    usableDistance: number;
    position: {
        x: number;
        y: number;
    };
}

export interface TaskInfo {
    id: number;
    taskType: TaskType;
    length: TaskLength;
    consoles: Record<number, TaskConsoleInfo>;
}
