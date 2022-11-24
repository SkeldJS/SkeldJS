import { AuthMethod, SkeldjsClient } from "@skeldjs/client";
import { AcknowledgePacket, HelloPacket, ReliablePacket } from "@skeldjs/protocol";
import { ReactorMod } from "./ReactorMod";

import {
    ModdedHelloPacket,
    ReactorHandshakeMessage,
    ReactorMessage,
    ReactorModDeclarationMessage
} from "./packets";

export class ReactorClient {
    mods: Map<string, ReactorMod>;

    constructor(
        public readonly client: SkeldjsClient
    ) {
        this.mods = new Map;

        client.decoder.register(
            ModdedHelloPacket,
            ReactorHandshakeMessage,
            ReactorMessage,
            ReactorModDeclarationMessage
        );

        client.on("client.identify", async identify => {
            identify.cancel();

            const nonce = client.getNextNonce();

            await client.send(
                new ModdedHelloPacket(
                    new HelloPacket(
                        nonce,
                        client.version,
                        identify.username,
                        client.config.authMethod === AuthMethod.SecureTransport
                            ? client.config.eosProductUserId
                            : identify.authToken,
                        client.config.language,
                        client.config.chatMode,
                        client.config.platform,
                    ),
                    1,
                    this.mods.size
                )
            );

            await client.decoder.waitf(
                AcknowledgePacket,
                ack => ack.nonce === nonce
            );

            client.identified = true;
            client.username = identify.username;

            let incrNetid = 0;
            for (const [ , mod ] of this.mods) {
                await client.send(
                    new ReliablePacket(
                        client.getNextNonce(),
                        [
                            new ReactorMessage(
                                new ReactorModDeclarationMessage(
                                    incrNetid++,
                                    mod
                                )
                            )
                        ]
                    )
                );
            }
        });
    }

    registerMod(mod: ReactorMod) {
        if (this.client.connected)
            throw new Error("Cannot register mods while the client is currently connected to a server.");

        this.mods.set(mod.modId, mod);
    }
}
