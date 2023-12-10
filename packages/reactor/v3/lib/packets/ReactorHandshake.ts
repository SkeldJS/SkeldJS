import { HazelReader, HazelWriter } from "@skeldjs/util";
import { MessageDirection } from "@skeldjs/protocol";
import { BaseReactorMessage } from "./BaseReactorMessage";
import { ReactorMod } from "../ReactorMod";
import { ReactorMessageTag } from "../constants";

export class ReactorHandshakeMessage extends BaseReactorMessage {
    static messageTag = ReactorMessageTag.Handshake as const;
    messageTag = ReactorMessageTag.Handshake as const;

    mods?: ReactorMod[];
    serverName?: string;
    serverVersion?: string;
    numPlugins?: number;

    constructor(mods: ReactorMod[]);
    constructor(
        serverName: string,
        serverVersion: string,
        numPlugins: number
    );
    constructor(
        serverNameOrMods: string|ReactorMod[],
        serverVersion?: string,
        numPlugins?: number
    ) {
        super();

        if (Array.isArray(serverNameOrMods)) {
            this.mods = serverNameOrMods;
        } else {
            this.serverName = serverNameOrMods;
            this.serverVersion = serverVersion;
            this.numPlugins = numPlugins;
        }
    }

    isClientToServer(): this is { mods: ReactorMod[] } {
        return Array.isArray(this.mods);
    }

    isServerToClient(): this is { serverName: string; serverVersion: string; numPlugins: number; } {
        return this.serverName !== undefined;
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection) {
        if (direction === MessageDirection.Serverbound) {
            const numMods = reader.packed();
            const mods = reader.lread(numMods, ReactorMod);

            return new ReactorHandshakeMessage(mods);
        } else if (direction === MessageDirection.Clientbound) {
            const serverName = reader.string();
            const serverVersion = reader.string();
            const numPlugins = reader.packed();

            return new ReactorHandshakeMessage(serverName, serverVersion, numPlugins);
        }

        throw new Error("Invalid message direction");
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Serverbound) {
            writer.lwrite(true, this.mods!);
        } else if (direction === MessageDirection.Clientbound) {
            writer.string(this.serverName!);
            writer.string(this.serverVersion!);
            writer.packed(this.numPlugins!);
        }
    }

    clone(): ReactorHandshakeMessage {
        if (this.isClientToServer()) {
            return new ReactorHandshakeMessage(this.mods);
        } else if (this.isServerToClient()) {
            return new ReactorHandshakeMessage(this.serverName, this.serverVersion, this.numPlugins);
        }

        return super.clone() as ReactorHandshakeMessage;
    }
}
