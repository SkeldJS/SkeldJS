import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";
import { GameSettings } from "../../../misc";

export class OptionsLogicComponentDataMessage extends BaseDataMessage {
    constructor(public readonly settings: GameSettings) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): OptionsLogicComponentDataMessage {
        const settings = GameSettings.deserializeFromReader(reader, true);
        return new OptionsLogicComponentDataMessage(settings);
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.write(this.settings, true, 10);
    }

    clone(): OptionsLogicComponentDataMessage {
        return new OptionsLogicComponentDataMessage(this.settings.clone());
    }
}