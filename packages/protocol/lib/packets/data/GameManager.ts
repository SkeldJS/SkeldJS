import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseDataMessage } from "./BaseDataMessage";
import { UnknownDataMessage } from "./Unknown";
import { TaggedDataMessage } from "./TaggedDataMessage";

export class LogicDataMessage extends TaggedDataMessage {
    constructor(public readonly index: number, data: BaseDataMessage) {
        super(index, data);
    }
    
    clone(): LogicDataMessage {
        return new LogicDataMessage(this.index, this.data.clone());
    }
}

export class GameManagerDataMessage extends BaseDataMessage {
    constructor(public readonly components: LogicDataMessage[]) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): GameManagerDataMessage {
        const message = new GameManagerDataMessage([]);
        while (reader.left) {
            const [ tag, dataReader ] = reader.message();
            message.components.push(new LogicDataMessage(tag, new UnknownDataMessage(dataReader)));
        }
        return message;
    }
    
    serializeToWriter(writer: HazelWriter): void {
        for (const component of this.components) {
            writer.begin(component.messageTag);
            component.serializeToWriter(writer);
            writer.end();
        }
    }

    clone(): GameManagerDataMessage {
        return new GameManagerDataMessage(this.components.map(c => c.clone()));
    }
}