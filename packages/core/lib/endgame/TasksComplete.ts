import { TaskState } from "../misc";

export interface TasksCompleteEndgameMetadata {
    totalTasks: number;
    completeTasks: number;
    taskStates: Map<number, TaskState[]>;
}
