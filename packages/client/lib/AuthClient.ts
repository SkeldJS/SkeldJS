import { Platform } from "@skeldjs/constant";
import { DtlsSocket } from "@skeldjs/dtls";

import {
    AcknowledgePacket,
    DisconnectPacket,
    MessageDirection,
    PacketDecoder,
    PingPacket,
    ReliablePacket,
    UnreliablePacket
} from "@skeldjs/protocol";

import { HazelWriter, sleep, VersionInfo } from "@skeldjs/util";
import { SkeldjsClient } from "./client";
import { AuthHelloPacket } from "./packets/AuthHello";
import { TokenResponseMessage } from "./packets/TokenResponse";

export class AuthClient {
    socket: DtlsSocket
    decoder: PacketDecoder<void>;

    constructor(public readonly client: SkeldjsClient) {
        this.socket = new DtlsSocket;
        this.decoder = new PacketDecoder;
        this.decoder.clear();

        this.decoder.register(
            UnreliablePacket,
            ReliablePacket,
            AuthHelloPacket,
            DisconnectPacket,
            AcknowledgePacket,
            PingPacket
        );

        this.decoder.register(TokenResponseMessage);

        this.socket.on("message", data => {
            this.decoder.write(data, MessageDirection.Clientbound);
        });
    }

    async getAuthToken(ip: string, port: number) {
        await this.socket.connect(ip, port);
        this.socket.restartConnection();

        const helloWriter = HazelWriter.alloc(11);
        helloWriter.uint8(AuthHelloPacket.messageTag);
        helloWriter.write(
            new AuthHelloPacket(
                1,
                VersionInfo.from(0x03030fcc),
                Platform.StandaloneItch,
                ""
            )
        );

        this.socket?.send(helloWriter.buffer);

        const tokenResponse = await Promise.race([
            this.decoder.wait(TokenResponseMessage),
            sleep(5000)
        ]);

        const disconnectWriter = HazelWriter.alloc(1);
        disconnectWriter.uint8(9);

        this.socket.send(disconnectWriter.buffer);

        const token = tokenResponse ? tokenResponse.message.token : 0;
        return token;
    }
}
