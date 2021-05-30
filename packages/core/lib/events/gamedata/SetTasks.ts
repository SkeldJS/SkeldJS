import { BasicEvent } from "@skeldjs/events";
import { RoomEvent } from "../RoomEvent";
import { GameData } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerGameData } from "../../misc/PlayerGameData";
import { GameDataEvent } from "./GameDataEvent";

export class GameDataSetTasksEvent extends BasicEvent implements RoomEvent, GameDataEvent {
    static eventName = "gamedata.settasks" as const;
    eventName = "gamedata.settasks" as const;

    private _alteredTasks: number[];

    constructor(
        public readonly room: Hostable,
        public readonly gamedata: GameData,
        public readonly player: PlayerGameData,
        public readonly oldTasks: number[],
        public readonly newTasks: number[]
    ) {
        super();

        this._alteredTasks = newTasks;
    }

    get alteredTasks() {
        return this._alteredTasks;
    }

    revert() {
        return this.setTasks(this.oldTasks);
    }

    setTasks(tasks: number[]) {
        this._alteredTasks = tasks;
    }
}
