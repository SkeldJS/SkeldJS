import { BasicEvent, EventData, EventEmitter } from "@skeldjs/events";
import { BaseDataMessage } from "@skeldjs/protocol";
import { HazelReader } from "@skeldjs/hazel";
import { StatefulRoom } from "../StatefulRoom";
import { InnerGameManager } from "../objects";

export abstract class GameLogicComponent<Events extends EventData, RoomType extends StatefulRoom> extends EventEmitter<Events> {
    isDirty: boolean;

    constructor(public readonly manager: InnerGameManager<RoomType>) {
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

    abstract parseData(reader: HazelReader): BaseDataMessage|undefined;
    abstract handleData(data: BaseDataMessage): Promise<void>;
    abstract createData(): BaseDataMessage|undefined;
    
    abstract processFixedUpdate(deltaTime: number): Promise<void>;

    abstract onGameStart(): Promise<void>;
    abstract onGameEnd(): Promise<void>;
    abstract onDestroy(): Promise<void>;

    abstract onPlayerDisconnect(): Promise<void>;
}
