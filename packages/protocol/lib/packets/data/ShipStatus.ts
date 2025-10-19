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
    constructor(public readonly isSpawn: boolean, public readonly systems: SystemStatusDataMessage[]) {
        super();
    }

    static deserializeFromReaderState(reader: HazelReader, isSpawn: boolean): ShipStatusDataMessage {
        const message = new ShipStatusDataMessage(isSpawn, []);
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
        return new ShipStatusDataMessage(this.isSpawn, this.systems.map(c => c.clone()));
    }
}