import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "./BaseDataMessage";
import { UnknownDataMessage } from "./Unknown";
import { TaggedDataMessage } from "./TaggedDataMessage";

export class SystemStatusDataMessage extends TaggedDataMessage {
    constructor(public readonly systemType: number, data: BaseDataMessage) {
        super(systemType, data);
    }

    clone(): SystemStatusDataMessage {
        return new SystemStatusDataMessage(this.systemType, this.data.clone());
    }
}

export class ShipStatusDataMessage extends BaseDataMessage {
    constructor(public readonly systems: SystemStatusDataMessage[]) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): ShipStatusDataMessage {
        const message = new ShipStatusDataMessage([]);
        while (reader.left) {
            const [ tag, dataReader ] = reader.message();
            message.systems.push(new SystemStatusDataMessage(tag, new UnknownDataMessage(dataReader)));
        }
        return message;
    }
    
    serializeToWriter(writer: HazelWriter): void {
        for (const component of this.systems) {
            writer.begin(component.messageTag);
            component.serializeToWriter(writer);
            writer.end();
        }
    }

    clone(): ShipStatusDataMessage {
        return new ShipStatusDataMessage(this.systems.map(c => c.clone()));
    }
}