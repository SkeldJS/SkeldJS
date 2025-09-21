import { TaskState } from "../objects";

export interface TasksCompleteEndgameMetadata {
    totalTasks: number;
    completeTasks: number;
    taskStates: Map<number, TaskState[]>;
}
