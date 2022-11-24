import { BaseGameDataMessage, MessageDirection, PacketDecoder, SpawnMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { GameDataMessageTag } from "@skeldjs/constant";

import { ReactorHandshakeMessage } from "./ReactorHandshake";
import { ReactorHeader } from "./ReactorHeader";
import { ReactorMessageTag } from "../constants";

export class ReactorSpawnMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Spawn as const;
    messageTag = GameDataMessageTag.Spawn as const;

    constructor(public readonly spawn: SpawnMessage, public readonly header?: ReactorHeader, public readonly handshake?: ReactorHandshakeMessage) {
        super();
    }

    isModded(): this is { header: ReactorHeader; handshake: ReactorHandshakeMessage; } {
        return this.header !== undefined && this.handshake !== undefined;
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection, decoder: PacketDecoder) {
        const spawn = reader.read(SpawnMessage);
        const reactorHeader = reader.read(ReactorHeader);

        if (!reactorHeader.isValid())
            return new ReactorSpawnMessage(spawn, undefined);

        const messageClass = decoder.types.get(`reactor-rpc:${ReactorMessageTag.Handshake}`);

        if (!messageClass)
            throw new Error("Reactor handshake message not registered");

        const handshake = reader.read(messageClass, direction, decoder) as ReactorHandshakeMessage;
        return new ReactorSpawnMessage(spawn, reactorHeader, handshake);
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        writer.write(this.spawn);
        if (this.isModded()) {
            writer.write(this.header);
            writer.write(this.handshake, direction);
        }
    }

    clone() {
        return new ReactorSpawnMessage(
            this.spawn.clone(),
            this.header,
            this.handshake?.clone()
        );
    }
}
