import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";
import { ActiveConsoleDataMessage } from "./Consoles";

export class ReactorSystemDataMessage extends BaseDataMessage {
    constructor(
        public readonly timer: number,
        public readonly userConsolePairs: ActiveConsoleDataMessage[],
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): ReactorSystemDataMessage {
        const timer = reader.float();
        const message = new ReactorSystemDataMessage(timer, []);
        const numPairs = reader.upacked();
        for (let i = 0; i < numPairs; i++) {
            message.userConsolePairs.push(ActiveConsoleDataMessage.deserializeFromReader(reader));
        }
        return message;
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.float(this.timer);
        writer.upacked(this.userConsolePairs.length);
        for (const userConsolePair of this.userConsolePairs) writer.write(userConsolePair);
    }

    clone(): ReactorSystemDataMessage {
        return new ReactorSystemDataMessage(
            this.timer,
            this.userConsolePairs.map(x => x.clone()),
        );
    }
}