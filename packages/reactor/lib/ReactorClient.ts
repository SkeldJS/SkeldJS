import { SkeldjsClient } from "@skeldjs/client";
import { AcknowledgePacket, ReliablePacket } from "@skeldjs/protocol";
import { ModdedHelloPacket, ReactorMessage, ReactorModDeclarationMessage } from "./packets";
import { ReactorMod } from "./ReactorMod";

export class ReactorClient {
    mods: Map<string, ReactorMod>;

    constructor(
        public readonly client: SkeldjsClient
    ) {
        this.mods = new Map;

        client.on("client.identify", async identify => {
            identify.cancel();

            const nonce = client.getNextNonce();

            await client.send(
                new ModdedHelloPacket(
                    nonce,
                    client.version,
                    identify.username,
                    identify.token,
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
            client.token = identify.token;

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
