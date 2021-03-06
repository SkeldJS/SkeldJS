import assert from "assert";

import { EventEmitter } from "./EventEmitter";

type TestEvents = {
    "hello.123": { alphabet: number };
};

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

            const went_through = await emitter.emit("hello.123", {
                alphabet: 5,
            });
            assert(!went_through);
            assert(!didreceive);
        });
    });

    describe("EventEmitter#on", () => {
        it("Should add a listener and return a function removing it.", () => {
            const emitter = new EventEmitter<TestEvents>();
            const listeners = emitter.getListeners("hello.123");

            const off = emitter.on("hello.123", async (ev, data) => {
                assert.strictEqual(data.alphabet, 5);
            });

            assert.strictEqual(listeners.size, 1);
            off();
            assert.strictEqual(listeners.size, 0);
        });
    });

    describe("EventEmitter#once", () => {
        it("Should only listen to an event once, before being removed.", () => {
            const emitter = new EventEmitter<TestEvents>();
            const listeners = emitter.getListeners("hello.123");

            emitter.once("hello.123", async (ev, data) => {
                assert.strictEqual(data.alphabet, 6);
            });

            assert.strictEqual(listeners.size, 1);
            emitter.emit("hello.123", { alphabet: 6 });
            assert.strictEqual(listeners.size, 0);
        });
    });

    describe("EventEmitter#off", () => {
        it("Should remove a listener.", () => {
            const emitter = new EventEmitter<TestEvents>();
            const listeners = emitter.getListeners("hello.123");

            async function response(ev, data) {
                assert.strictEqual(data.alphabet, 5);
            }

            emitter.on("hello.123", response);
            assert.strictEqual(listeners.size, 1);
            emitter.off("hello.123", response);
            assert.strictEqual(listeners.size, 0);
        });
    });

    describe("EventEmitter#getListeners", () => {
        it("Get listeners for an event.", () => {
            const emitter = new EventEmitter<TestEvents>();
            const listeners = emitter.getListeners("hello.123");

            async function response(ev, data) {
                assert.strictEqual(data.alphabet, 5);
            }

            emitter.on("hello.123", response);
            assert.strictEqual(listeners.size, 1);
        });
    });
});
