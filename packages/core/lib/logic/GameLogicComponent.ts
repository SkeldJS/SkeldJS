import { BasicEvent, EventData, EventEmitter } from "@skeldjs/events";
import { BaseRpcMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { Hostable } from "../Hostable";
import { InnerGameManager } from "../objects";

export abstract class GameLogicComponent<Events extends EventData, RoomType extends Hostable = Hostable> extends EventEmitter<Events> {
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

    FixedUpdate(deltaTime: number) {}
    async HandleRpc(rpc: BaseRpcMessage) {}
    Serialize(writer: HazelWriter, initialState: boolean) {}
    Deserialize(reader: HazelReader, initialState: boolean) {}

    async onGameStart() {}
    async onGameEnd() {}
    async onDestroy() {}

    async onPlayerDisconnect() {}
}
