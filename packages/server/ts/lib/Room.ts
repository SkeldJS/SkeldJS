import {
    Hostable,
    Opcode,
    PayloadTag,
    PlayerData,
    PlayerDataResolvable
} from "@skeldjs/core";
import { GameDataMessage, GameDataPayload, GameDataToPayload, PayloadMessageClientbound } from "@skeldjs/protocol";
import { SpecialID } from "./constants/IDs";

import { RoomConfig } from "./interface/RoomConfig";
import { RemoteClient } from "./RemoteClient";
import { SkeldjsServer } from "./server";

export type RoomEvents = {

}

export class Room extends Hostable<RoomEvents> {
    remotes: Map<number, RemoteClient>;

    constructor(private server: SkeldjsServer, public options: RoomConfig) {
        super();

        this.remotes = new Map;
    }

    get me() {
        return null;
    }

    get amhost() {
        return this.hostid === SpecialID.SaaH;
    }

    handleLeave(resolvable: PlayerDataResolvable) {
        const player = super.handleLeave(resolvable);
        if (player)
            this.remotes.delete(player.id);

        return player;
    }

    async broadcast(messages: GameDataMessage[], reliable = true, recipient: PlayerData = null, payloads: PayloadMessageClientbound[] = []) {
        if (recipient) {
            const remote = this.remotes.get(recipient.id);
            if (remote) {
                await remote.send({
                    op: reliable ? Opcode.Reliable : Opcode.Unreliable,
                    payloads: [
                        ...(messages?.length ? [{
                            tag: PayloadTag.GameDataTo,
                            code: this.code,
                            recipientid: recipient.id,
                            messages
                        } as GameDataToPayload] : []),
                        ...payloads
                    ]
                });
            }
        } else {
            for (const [ , remote ] of this.remotes) {
                await remote.send({
                    op: reliable ? Opcode.Reliable : Opcode.Unreliable,
                    payloads: [
                        ...(messages?.length ? [{
                            tag: PayloadTag.GameData,
                            code: this.code,
                            messages
                        } as GameDataPayload] : []),
                        ...payloads
                    ]
                });
            }
        }
    }
}
