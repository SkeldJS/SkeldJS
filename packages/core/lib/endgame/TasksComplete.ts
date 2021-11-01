export interface FinalTaskState {
    taskId: number;
    completed: boolean;
}

export interface TasksCompleteEndgameMetadata {
    totalTasks: number;
    completeTasks: number;
    taskStates: Map<number, FinalTaskState[]>;
}
