import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseDataMessage } from "../BaseDataMessage";

export class DoorCooldownDataMessage extends BaseDataMessage {
    constructor(public readonly systemType: number, public readonly cooldown: number) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): DoorCooldownDataMessage {
        const systemType = reader.uint8();
        const cooldown = reader.float();
        return new DoorCooldownDataMessage(systemType, cooldown);
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.uint8(this.systemType);
        writer.float(this.cooldown);
    }

    clone(): DoorCooldownDataMessage {
        return new DoorCooldownDataMessage(this.systemType, this.cooldown);
    }
}

export class DoorsSystemDataMessage extends BaseDataMessage {
    constructor(
        public readonly cooldowns: DoorCooldownDataMessage[],
        public readonly doorStates: boolean[]
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): DoorsSystemDataMessage {
        const message = new DoorsSystemDataMessage([], []);
        const numCooldowns = reader.upacked();
        for (let i = 0; i < numCooldowns; i++) {
            message.cooldowns.push(DoorCooldownDataMessage.deserializeFromReader(reader));
        }
        while (reader.left) {
            message.doorStates.push(reader.bool());
        }
        return message;
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.upacked(this.cooldowns.length);
        for (const cooldown of this.cooldowns) writer.write(cooldown);
        for (const isOpen of this.doorStates) writer.bool(isOpen);
    }

    clone(): DoorsSystemDataMessage {
        return new DoorsSystemDataMessage(this.cooldowns.map(x => x.clone()), [...this.doorStates]);
    }
}