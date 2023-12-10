import { BaseGameDataMessage, MessageDirection, PacketDecoder, SceneChangeMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { GameDataMessageTag } from "@skeldjs/constant";

import { ReactorHandshakeMessage } from "./ReactorHandshake";
import { ReactorHeader } from "./ReactorHeader";
import { ReactorMessageTag } from "../constants";

export class ReactorSceneChangeMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.SceneChange as const;
    messageTag = GameDataMessageTag.SceneChange as const;

    constructor(public readonly sceneChange: SceneChangeMessage, public readonly header?: ReactorHeader, public readonly handshake?: ReactorHandshakeMessage) {
        super();
    }

    isModded(): this is { header: ReactorHeader; handshake: ReactorHandshakeMessage; } {
        return this.header !== undefined && this.handshake !== undefined;
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection, decoder: PacketDecoder) {
        const sceneChange = reader.read(SceneChangeMessage);
        const reactorHeader = reader.read(ReactorHeader);

        if (!reactorHeader.isValid())
            return new ReactorSceneChangeMessage(sceneChange, undefined);

        const messageClass = decoder.types.get(`reactor-rpc:${ReactorMessageTag.Handshake}`);

        if (!messageClass)
            throw new Error("Reactor handshake message not registered");

        const handshake = reader.read(messageClass, direction, decoder) as ReactorHandshakeMessage;
        return new ReactorSceneChangeMessage(sceneChange, reactorHeader, handshake);
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        writer.write(this.sceneChange);
        if (this.isModded()) {
            writer.write(this.header);
            writer.write(this.handshake, direction);
        }
    }

    clone() {
        return new ReactorSceneChangeMessage(
            this.sceneChange.clone(),
            this.header,
            this.handshake?.clone()
        );
    }
}
