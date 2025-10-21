import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";
import { DeconState } from "@skeldjs/constant";

// TODO: bad implementation? should system be responsible for 'understanding'
// these new states?
export enum DeconNextState {
    EnterHeadingUp = 1,
    Enter,
    ExitHeadingUp,
    Exit
}

export class DeconSystemMessage extends BaseSystemMessage {
    constructor(
        public readonly state: DeconState,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const nextMode = reader.uint8();
        switch (nextMode) {
        case DeconNextState.EnterHeadingUp:
            return new DeconSystemMessage(DeconState.Enter | DeconState.HeadingUp);
        case DeconNextState.Enter:
            return new DeconSystemMessage(DeconState.Enter);
        case DeconNextState.ExitHeadingUp:
            return new DeconSystemMessage(DeconState.Exit | DeconState.HeadingUp);
        case DeconNextState.Exit:
            return new DeconSystemMessage(DeconState.Exit);
        }
        return new DeconSystemMessage(DeconState.Idle);
    }

    serializeToWriter(writer: HazelWriter) {
        switch (this.state) {
            case DeconState.Enter | DeconState.HeadingUp:
                writer.uint8(DeconNextState.EnterHeadingUp);
                break;
            case DeconState.Enter:
                writer.uint8(DeconNextState.Enter);
                break;
            case DeconState.Exit | DeconState.HeadingUp:
                writer.uint8(DeconNextState.ExitHeadingUp);
                break;
            case DeconState.Exit:
                writer.uint8(DeconNextState.Exit);
                break;
        }
        writer.uint8(0); // idk what to do in this case
    }

    clone() {
        return new DeconSystemMessage(this.state);
    }
}
