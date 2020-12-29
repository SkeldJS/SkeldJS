export interface PlayerGameData {
    playerId: number;
    name: string;
    color: number;
    hat: number;
    pet: number;
    skin: number;
    disconnected: boolean;
    impostor: boolean;
    dead: boolean;
    tasks: TaskState[];
}

export enum PlayerDataFlags {
    Disconnected = 1,
    Impostor = 2,
    Dead = 0x4
}

export interface TaskState {
    taskIdx: number;
    completed: boolean;
}
