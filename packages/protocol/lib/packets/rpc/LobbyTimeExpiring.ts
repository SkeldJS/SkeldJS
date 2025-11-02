import { RpcMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";
import { ExiledMessage } from "./Exiled";

export class LobbyExtension {
    constructor(
        public readonly hostId: number,
        public readonly extensionId: number,
        public readonly extensionSeconds: number
    ) {
    }

    static deserializeFromReader(reader: HazelReader) {
        const hostId = reader.packed();
        const extensionId = reader.packed();
        const extensionSeconds = reader.packed();
        return new LobbyExtension(hostId, extensionId, extensionSeconds);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.hostId);
        writer.upacked(this.extensionId);
        writer.upacked(this.extensionSeconds);
    }

    clone() {
        return new LobbyExtension(this.hostId, this.extensionId, this.extensionSeconds);
    }
}

export class LobbyTimeExpiringMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.LobbyTimeExpiring;

    constructor(public readonly secondsRemaining: number, public readonly availableExtension: LobbyExtension|null) {
        super(LobbyTimeExpiringMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const secondsRemaining = reader.packed();
        const extensionAvailable = reader.bool();
        if (extensionAvailable) {
            return new LobbyTimeExpiringMessage(secondsRemaining, LobbyExtension.deserializeFromReader(reader));
        } else {
            return new LobbyTimeExpiringMessage(secondsRemaining, null);
        }
    }

    serializeToWriter(writer: HazelWriter) {
        writer.packed(this.secondsRemaining);
        writer.bool(this.availableExtension !== null);
        if (this.availableExtension) {
            this.availableExtension.serializeToWriter(writer);
        }
    }

    clone() {
        return new LobbyTimeExpiringMessage(this.secondsRemaining, this.availableExtension ? this.availableExtension.clone() : null);
    }
}
