import { TaskState } from "./TaskState";

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
