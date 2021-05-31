import assert from "assert";
import { CancelableEvent } from "./CancelableEvent";

import { EventEmitter, ExtractEventTypes } from "./EventEmitter";

const sleep = (ms) =>
    new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

class TestEvent extends CancelableEvent {
    static eventName = "hello.123" as const;
    eventName = "hello.123" as const;

    alphabet: number;

    constructor(alphabet: number) {
        super();

        this.alphabet = alphabet;
    }
}

type TestEvents = ExtractEventTypes<[TestEvent]>;

describe("EventEmitter", () => {
    describe("EventEmitter#emit", () => {
        it("Should emit an event with provided data.", async () => {
            let didreceive = false;
            const emitter: EventEmitter<TestEvents> = new EventEmitter;

            emitter.on("hello.123", async (ev) => {
                assert.strictEqual(ev.alphabet, 5);
                didreceive = true;
            });

            await emitter.emit(new TestEvent(5));
            assert.ok(didreceive);
        });

        it("Should detect when events are cancelled by listeners.", async () => {
            let didreceive = false;
            const emitter: EventEmitter<TestEvents> = new EventEmitter;

            emitter.on("hello.123", async (ev) => {
                assert.strictEqual(ev.alphabet, 5);
                ev.cancel();
            });

            emitter.on("hello.123", async (ev) => {
                if (ev.canceled) return;
                didreceive = true;
            });

            const ev = await emitter.emit(new TestEvent(5));
            assert.ok(ev.canceled);
            assert.ok(!didreceive);
        });
    });

    describe("EventEmitter#on", () => {
        it("Should add a listener and return a function removing it.", () => {
            const emitter: EventEmitter<TestEvents> = new EventEmitter;
            const listeners = emitter.getListeners("hello.123");

            const off = emitter.on("hello.123", async (ev) => {
                assert.strictEqual(ev.alphabet, 5);
            });

            assert.strictEqual(listeners.size, 1);
            off();
            assert.strictEqual(listeners.size, 0);
        });
    });

    describe("EventEmitter#once", () => {
        it("Should only listen to an event once, before being removed.", () => {
            const emitter: EventEmitter<TestEvents> = new EventEmitter;
            const listeners = emitter.getListeners("hello.123");

            emitter.once("hello.123", async (ev) => {
                assert.strictEqual(ev.alphabet, 6);
            });

            assert.strictEqual(listeners.size, 1);
            emitter.emit(new TestEvent(6));
            assert.strictEqual(listeners.size, 0);
        });
    });

    describe("EventEmitter#wait", () => {
        it("Should wait until an event is called.", async () => {
            const emitter: EventEmitter<TestEvents> = new EventEmitter;
            const listeners = emitter.getListeners("hello.123");

            (async () => {
                await sleep(100);
                await emitter.emit(new TestEvent(6));
            })();

            const date = Date.now();
            const ev = await emitter.wait("hello.123");

            assert.strictEqual(ev.alphabet, 6);

            assert.ok(Date.now() - date > 40);
            assert.strictEqual(listeners.size, 0);
        });
    });

    describe("EventEmitter#off", () => {
        it("Should remove a single listener for an event.", () => {
            const emitter: EventEmitter<TestEvents> = new EventEmitter;
            const listeners = emitter.getListeners("hello.123");

            async function response(ev: TestEvent) {
                assert.strictEqual(ev.alphabet, 5);
            }

            emitter.on("hello.123", response);
            assert.strictEqual(listeners.size, 1);
            emitter.off("hello.123", response);
            assert.strictEqual(listeners.size, 0);
        });
    });

    describe("EventEmitter#getListeners", () => {
        it("Should get all listeners for an event.", () => {
            const emitter: EventEmitter<TestEvents> = new EventEmitter;
            const listeners = emitter.getListeners("hello.123");

            async function response(ev: TestEvent) {
                assert.strictEqual(ev.alphabet, 5);
            }

            emitter.on("hello.123", response);
            assert.strictEqual(listeners.size, 1);
        });
    });

    describe("EventEmitter#removeListeners", () => {
        it("Should remove all listeners from an event.", async () => {
            let didreceive = false;
            const emitter: EventEmitter<TestEvents> = new EventEmitter;
            const listeners = emitter.getListeners("hello.123");

            emitter.on("hello.123", async (ev) => {
                assert.strictEqual(ev.alphabet, 5);
                didreceive = true;
            });

            assert.strictEqual(listeners.size, 1);

            await emitter.emit(new TestEvent(5));
            assert.ok(didreceive);

            emitter.removeListeners("hello.123");
            assert.strictEqual(listeners.size, 0);
        });
    });

    describe("EventEmitter#removeAllListeners", () => {
        it("Should remove all listeners from all events.", async () => {
            let didreceive = false;
            const emitter: EventEmitter<TestEvents> = new EventEmitter;
            const listeners = emitter.getListeners("hello.123");

            emitter.on("hello.123", async (ev) => {
                assert.strictEqual(ev.alphabet, 5);
                didreceive = true;
            });

            assert.strictEqual(listeners.size, 1);

            await emitter.emit(new TestEvent(5));
            assert.ok(didreceive);

            emitter.removeAllListeners();
            assert.strictEqual(listeners.size, 0);
        });
    });
});
