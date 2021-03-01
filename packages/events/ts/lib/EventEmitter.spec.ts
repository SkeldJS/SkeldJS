import assert from "assert";

import { EventEmitter } from "./EventEmitter";

type TestEvents = {
    "hello.123": { alphabet: number }
}

describe("EventEmitter", () => {
    describe("EventEmitter#emit", () => {
        it("Should emit an event with provided data.", async () => {
            let didreceive = false;
            const emitter = new EventEmitter<TestEvents>();

            emitter.on("hello.123", async (ev, data) => {
                assert.strictEqual(data.alphabet, 5);
                didreceive = true;
            });

            await emitter.emit("hello.123", { alphabet: 5 });
            assert(didreceive);
        });

        it("Should detect when events are cancelled by listeners.", async () => {
            let didreceive = false;
            const emitter = new EventEmitter<TestEvents>();

            emitter.on("hello.123", async (ev, data) => {
                assert.strictEqual(data.alphabet, 5);
                ev.cancel();
            });

            emitter.on("hello.123", async () => {
                didreceive = true;
            });

            const went_through = await emitter.emit("hello.123", { alphabet: 5 });
            assert(!went_through);
            assert(!didreceive);
        });
    });

    describe("EventEmitter#on", () => {
        it("Should add a listener and return a function removing it.", () => {
            const emitter = new EventEmitter<TestEvents>();

            const off = emitter.on("hello.123", async (ev, data) => {
                assert.strictEqual(data.alphabet, 5);
            });
            const listeners = emitter.listeners.get("hello.123");

            assert.strictEqual(listeners.size, 1);
            off();
            assert.strictEqual(listeners.size, 0);
        });
    });

    describe("EventEmitter#once", () => {
        it("Should add a listener and return a function removing it.", () => {
            const emitter = new EventEmitter<TestEvents>();

            const off = emitter.on("hello.123", async (ev, data) => {
                assert.strictEqual(data.alphabet, 5);
            });
            const listeners = emitter.listeners.get("hello.123");

            assert.strictEqual(listeners.size, 1);
            off();
            assert.strictEqual(listeners.size, 0);
        });
    });
});
