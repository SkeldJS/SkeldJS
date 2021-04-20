import assert from "assert";

import { EventContext, EventEmitter } from "./EventEmitter";

const sleep = (ms) =>
    new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
interface TestEvents {
    "hello.123": {
        alphabet: number;
    };
}

describe("EventEmitter", () => {
    describe("EventEmitter#emit", () => {
        it("Should emit an event with provided data.", async () => {
            let didreceive = false;
            const emitter = new EventEmitter<TestEvents>();

            emitter.on("hello.123", async (ev) => {
                assert.strictEqual(ev.data.alphabet, 5);
                didreceive = true;
            });

            await emitter.emit("hello.123", { alphabet: 5 });
            assert.ok(didreceive);
        });

        it("Should detect when events are cancelled by listeners.", async () => {
            let didreceive = false;
            const emitter = new EventEmitter<TestEvents>();

            emitter.on("hello.123", async (ev) => {
                assert.strictEqual(ev.data.alphabet, 5);
                ev.cancel();
            });

            emitter.on("hello.123", async (ev) => {
                if (ev.cancelled) return;

                didreceive = true;
            });

            const went_through = await emitter.emit("hello.123", {
                alphabet: 5,
            });
            assert.ok(!went_through);
            assert.ok(!didreceive);
        });
    });

    describe("EventEmitter#on", () => {
        it("Should add a listener and return a function removing it.", () => {
            const emitter = new EventEmitter<TestEvents>();
            const listeners = emitter.getListeners("hello.123");

            const off = emitter.on("hello.123", async (ev) => {
                assert.strictEqual(ev.data.alphabet, 5);
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

            emitter.once("hello.123", async (ev) => {
                assert.strictEqual(ev.data.alphabet, 6);
            });

            assert.strictEqual(listeners.size, 1);
            emitter.emit("hello.123", { alphabet: 6 });
            assert.strictEqual(listeners.size, 0);
        });
    });

    describe("EventEmitter#wait", () => {
        it("Should wait until an event is called.", async () => {
            const emitter = new EventEmitter<TestEvents>();
            const listeners = emitter.getListeners("hello.123");

            (async () => {
                await sleep(100);
                await emitter.emit("hello.123", { alphabet: 6 });
            })();

            const date = Date.now();
            const ev = await emitter.wait("hello.123");

            assert.strictEqual(ev.data.alphabet, 6);

            assert.ok(Date.now() - date > 40);
            assert.strictEqual(listeners.size, 0);
        });
    });

    describe("EventEmitter#off", () => {
        it("Should remove a single listener for an event.", () => {
            const emitter = new EventEmitter<TestEvents>();
            const listeners = emitter.getListeners("hello.123");

            async function response(ev: EventContext<{ alphabet: number }>) {
                assert.strictEqual(ev.data.alphabet, 5);
            }

            emitter.on("hello.123", response);
            assert.strictEqual(listeners.size, 1);
            emitter.off("hello.123", response);
            assert.strictEqual(listeners.size, 0);
        });
    });

    describe("EventEmitter#getListeners", () => {
        it("Should get all listeners for an event.", () => {
            const emitter = new EventEmitter<TestEvents>();
            const listeners = emitter.getListeners("hello.123");

            async function response(ev: EventContext<{ alphabet: number }>) {
                assert.strictEqual(ev.data.alphabet, 5);
            }

            emitter.on("hello.123", response);
            assert.strictEqual(listeners.size, 1);
        });
    });

    describe("EventEmitter#removeListeners", () => {
        it("Should remove all listeners from an event.", async () => {
            let didreceive = false;
            const emitter = new EventEmitter<TestEvents>();
            const listeners = emitter.getListeners("hello.123");

            emitter.on("hello.123", async (ev) => {
                assert.strictEqual(ev.data.alphabet, 5);
                didreceive = true;
            });

            assert.strictEqual(listeners.size, 1);

            await emitter.emit("hello.123", { alphabet: 5 });
            assert.ok(didreceive);

            emitter.removeListeners("hello.123");
            assert.strictEqual(listeners.size, 0);
        });
    });

    describe("EventEmitter#removeAllListeners", () => {
        it("Should remove all listeners from all events.", async () => {
            let didreceive = false;
            const emitter = new EventEmitter<TestEvents>();
            const listeners = emitter.getListeners("hello.123");

            emitter.on("hello.123", async (ev) => {
                assert.strictEqual(ev.data.alphabet, 5);
                didreceive = true;
            });

            assert.strictEqual(listeners.size, 1);

            await emitter.emit("hello.123", { alphabet: 5 });
            assert.ok(didreceive);

            emitter.removeAllListeners();
            assert.strictEqual(listeners.size, 0);
        });
    });
});
