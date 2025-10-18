import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";

export class FlowLogicComponentDataMessage extends BaseDataMessage {
    constructor(public readonly hideTime: number, public readonly finalHideTime: number) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): FlowLogicComponentDataMessage {
        const hideTime = reader.float();
        const finalHideTime = reader.float();
        return new FlowLogicComponentDataMessage(hideTime, finalHideTime);
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.float(this.hideTime);
        writer.float(this.finalHideTime);
    }

    clone(): FlowLogicComponentDataMessage {
        return new FlowLogicComponentDataMessage(this.hideTime, this.finalHideTime);
    }
}