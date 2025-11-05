import { BasicEvent, EventEmitter, EventMap } from "@skeldjs/events";
import { BaseSystemMessage } from "@skeldjs/au-protocol";
import { HazelReader } from "@skeldjs/hazel";
import { StatefulRoom } from "../StatefulRoom";
import { GameManager } from "../objects";

export abstract class GameLogicComponent<Events extends EventMap, RoomType extends StatefulRoom> extends EventEmitter<Events> {
    isDirty: boolean;

    constructor(public readonly manager: GameManager<RoomType>) {
        super();

        this.isDirty = false;
    }

    async emit<Event extends BasicEvent>(event: Event): Promise<Event> {
        if (this.manager) {
            this.manager.emit(event as any);
        }

        return super.emit(event);
    }

    async emitSerial<Event extends BasicEvent>(event: Event): Promise<Event> {
        if (this.manager) {
            this.manager.emitSerial(event as any);
        }

        return super.emitSerial(event);
    }

    emitSync<Event extends BasicEvent>(event: Event): Event {
        if (this.manager) {
            this.manager.emitSync(event as any);
        }

        return super.emitSync(event);
    }

    abstract parseData(reader: HazelReader): BaseSystemMessage|undefined;
    abstract handleData(data: BaseSystemMessage): Promise<void>;
    abstract createData(): BaseSystemMessage|undefined;
    
    abstract processFixedUpdate(deltaTime: number): Promise<void>;

    abstract onGameStart(): Promise<void>;
    abstract onGameEnd(): Promise<void>;
    abstract onDestroy(): Promise<void>;

    abstract onPlayerDisconnect(): Promise<void>;
}
