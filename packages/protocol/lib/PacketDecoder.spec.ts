import { GameOverReason } from "@skeldjs/constant";
import { sleep } from "@skeldjs/util";
import assert from "assert";

import { MessageDirection, PacketDecoder } from "./PacketDecoder";
import { BaseMessage } from "./packets/BaseMessage";
import { DataMessage, RpcMessage, SpawnMessage } from "./packets/game";
import {
    EndGameMessage,
    JoinGameMessage,
    StartGameMessage,
} from "./packets/root";

export class TestMessage extends BaseMessage {
    static messageType = "root" as const;
    static messageTag = 32 as const;

    messageType = "root" as const;
    messageTag = 32 as const;
}

describe("PacketDecoder", () => {
    describe("PacketDecoder#register", () => {
        it("Should register a message with a type and a tag", () => {
            const decoder = new PacketDecoder;
            decoder.register(TestMessage);

            assert.ok(decoder.types.get("root:32"));
        });
    });

    describe("PacketDecoder#getListeners", () => {
        it("Should retrieve all listeners for a message.", () => {
            const decoder = new PacketDecoder;

            const listeners = decoder.getListeners(TestMessage);

            assert.strictEqual(listeners.size, 0);

            decoder.on(TestMessage, () => {
                void 0;
            });

            assert.strictEqual(listeners.size, 1);
        });
    });

    describe("PacketDecoder#on and PacketDecoder#off", () => {
        it("Should listen for a message to be emitted and should be able to remove it.", () => {
            const decoder = new PacketDecoder;

            let did_recv = false;

            function onReceive(message: StartGameMessage) {
                if (message.code === 64) {
                    did_recv = true;
                }
            }

            decoder.on(StartGameMessage, onReceive);

            const packet = new StartGameMessage(64);

            decoder.emitDecoded(packet, MessageDirection.Clientbound, null);

            assert.ok(did_recv);

            did_recv = false;
            decoder.off(StartGameMessage, onReceive);
            decoder.emitDecoded(packet, MessageDirection.Clientbound, null);

            assert.ok(!did_recv);
        });

        it("Should listen to several messages to be emitted and should be able to remove them.", () => {
            const decoder = new PacketDecoder;

            let recv = 0;

            function onReceive(
                message: StartGameMessage | EndGameMessage | JoinGameMessage
            ) {
                if (message.code === 64) {
                    recv++;
                }
            }

            decoder.on(
                [StartGameMessage, EndGameMessage, JoinGameMessage],
                onReceive
            );

            decoder.emitDecoded(
                new StartGameMessage(64),
                MessageDirection.Clientbound,
                null
            );
            assert.strictEqual(recv, 1);

            decoder.emitDecoded(
                new EndGameMessage(64, GameOverReason.ImpostorByKill, false),
                MessageDirection.Clientbound,
                null
            );
            assert.strictEqual(recv, 2);

            decoder.emitDecoded(
                new JoinGameMessage(64, 0, 0),
                MessageDirection.Clientbound,
                null
            );
            assert.strictEqual(recv, 3);

            recv = 0;

            decoder.off(
                [StartGameMessage, EndGameMessage, JoinGameMessage],
                onReceive
            );
            decoder.emitDecoded(
                new StartGameMessage(64),
                MessageDirection.Clientbound,
                null
            );
            assert.strictEqual(recv, 0);

            decoder.emitDecoded(
                new EndGameMessage(64, GameOverReason.ImpostorByKill, false),
                MessageDirection.Clientbound,
                null
            );
            assert.strictEqual(recv, 0);

            decoder.emitDecoded(
                new JoinGameMessage(64, 0, 0),
                MessageDirection.Clientbound,
                null
            );
            assert.strictEqual(recv, 0);
        });

        it("Should return a function that removes the listener.", () => {
            const decoder = new PacketDecoder;

            assert.strictEqual(decoder.getListeners(StartGameMessage).size, 0);

            const removeListener = decoder.on(StartGameMessage, () => {
                void 0;
            });

            assert.strictEqual(decoder.getListeners(StartGameMessage).size, 1);

            removeListener();

            assert.strictEqual(decoder.getListeners(StartGameMessage).size, 0);
        });
    });

    describe("PacketDecoder#once", () => {
        it("Should listen to a message exactly once.", () => {
            const decoder = new PacketDecoder;

            let did_recv = false;

            function onReceive(message: StartGameMessage) {
                if (message.code === 64) {
                    did_recv = true;
                }
            }

            decoder.once(StartGameMessage, onReceive);

            const packet = new StartGameMessage(64);

            decoder.emitDecoded(packet, MessageDirection.Clientbound, null);

            assert.ok(did_recv);

            did_recv = false;
            decoder.emitDecoded(packet, MessageDirection.Clientbound, null);

            assert.ok(!did_recv);
        });

        it("Should listen to any of several messages exactly once.", () => {
            const decoder = new PacketDecoder;

            let recv = 0;

            function onReceive(
                message: StartGameMessage | EndGameMessage | JoinGameMessage
            ) {
                if (message.code === 64) {
                    recv++;
                }
            }

            decoder.once(
                [StartGameMessage, EndGameMessage, JoinGameMessage],
                onReceive
            );

            decoder.emitDecoded(
                new StartGameMessage(64),
                MessageDirection.Clientbound,
                null
            );
            assert.strictEqual(recv, 1);

            decoder.emitDecoded(
                new EndGameMessage(64, GameOverReason.ImpostorByKill, false),
                MessageDirection.Clientbound,
                null
            );
            assert.strictEqual(recv, 1);

            decoder.emitDecoded(
                new JoinGameMessage(64, 0, 0),
                MessageDirection.Clientbound,
                null
            );
            assert.strictEqual(recv, 1);

            recv = 0;
        });
    });

    describe("PacketDecoder#wait", () => {
        it("Should asynchronously wait for a message to be emitted.", async () => {
            const decoder = new PacketDecoder;

            (async () => {
                await sleep(100);
                await decoder.emitDecoded(
                    new StartGameMessage(64),
                    MessageDirection.Clientbound,
                    null
                );
            })();

            const date = Date.now();
            const ev = await decoder.wait(StartGameMessage);

            assert.strictEqual(ev.message.code, 64);

            assert.ok(Date.now() - date > 40);
            assert.strictEqual(decoder.getListeners(StartGameMessage).size, 0);
        });
    });

    describe("PacketDecoder#waitf", () => {
        it("Should asynchronously wait for a message to be emitted with a filter.", async () => {
            const decoder = new PacketDecoder;

            (async () => {
                await sleep(100);
                await decoder.emitDecoded(
                    new StartGameMessage(64),
                    MessageDirection.Clientbound,
                    null
                );
                await sleep(100);
            })();

            const date = Date.now();
            const ev = await decoder.waitf(
                StartGameMessage,
                (message) => message.code === 64
            );

            assert.strictEqual(ev.message.code, 64);

            assert.ok(Date.now() - date > 40);
            assert.strictEqual(decoder.getListeners(StartGameMessage).size, 0);

            const ev2 = await Promise.race([
                sleep(150),
                decoder.waitf(
                    StartGameMessage,
                    (message) => message.code === 64
                ),
            ]);

            assert.ok(!ev2);
        });
    });

    describe("PacketDecoder#write", () => {
        it("Should decode a message and emit it and its children recursively to listeners.", async () => {
            const buffer = Buffer.from(
                "010005b50005d0b5528c12000403feffffff0f0002010100010002010001001e0004048c9903010303020001010004000001050a00010000ff7fff7fff7fff7f31000203022e040a01000000000000803f0000803f0000c03f000034420101020100000002010f00000078000000000f010100000c000402feffffff0f000106000001090002030606496c6c72656b03000203080b030002031100030002030970030002030a09110001010d000006496c6c72656b0b7000090000",
                "hex"
            );

            const decoder = new PacketDecoder;

            let recv = 0;
            decoder.on([SpawnMessage, RpcMessage, DataMessage], () => {
                recv++;
            });

            await decoder.write(buffer, MessageDirection.Serverbound, undefined);

            assert.strictEqual(recv, 10);
        });
    });

    describe("PacketDecoder#parse", () => {
        it("Should decode a message without emitting the results.", () => {
            const buffer = Buffer.from(
                "010005b50005d0b5528c12000403feffffff0f0002010100010002010001001e0004048c9903010303020001010004000001050a00010000ff7fff7fff7fff7f31000203022e040a01000000000000803f0000803f0000c03f000034420101020100000002010f00000078000000000f010100000c000402feffffff0f000106000001090002030606496c6c72656b03000203080b030002031100030002030970030002030a09110001010d000006496c6c72656b0b7000090000",
                "hex"
            );

            const decoder = new PacketDecoder;

            const parsed = decoder.parse(buffer);

            assert.strictEqual(parsed.messageTag, 1);
            assert.strictEqual(parsed.children.length, 1);
            assert.strictEqual(parsed.children[0]?.children?.length, 10);
        });

        it("Should return null on an invalid message send option.", () => {
            const buffer = Buffer.from("69");
            const decoder = new PacketDecoder;

            const parsed = decoder.parse(buffer);

            assert.strictEqual(parsed, null);
        });
    });
});
