import { MessageTag, RpcTag } from "@skeldjs/constant";
import { HazelBuffer } from "@skeldjs/util";
import assert from "assert";
import { Heritable } from "./Heritable";
import { Hostable } from "./Hostable";

import { Networkable } from "./Networkable";
import { alphabet, TestComponent, TestEvents } from "./tests.spec";

describe("Networkable", () => {
    describe("Networkable#ctr", () => {
        it("Should instantiate a component with a room, netid, ownerid.", () => {
            const room = new Hostable();
            const component = new Networkable(room, 1, -2);

            assert.strictEqual(component.room, room);
            assert.strictEqual(component.netid, 1);
            assert.strictEqual(component.ownerid, -2);
        });

        it("Should also accept a data argument as an object to pass in information about the component.", () => {
            const room = new Hostable();
            const component = new TestComponent(room, 1, -2, {
                dataParam: 5,
            });

            assert.strictEqual(component.room, room);
            assert.strictEqual(component.netid, 1);
            assert.strictEqual(component.ownerid, -2);
            assert.strictEqual(component.dataParam, 5);
        });

        it("Should also accept a data argument as a buffer to pass in information about the component.", () => {
            const room = new Hostable();

            const buffer = HazelBuffer.from("05", "hex");

            const component = new TestComponent(room, 1, -2, buffer);

            assert.strictEqual(component.room, room);
            assert.strictEqual(component.netid, 1);
            assert.strictEqual(component.ownerid, -2);
            assert.strictEqual(component.dataParam, 5);
        });
    });

    describe("Networkable#emit", () => {
        it("Should emit an event that propagates through its owner.", async () => {
            const room = new Hostable();
            const object = new Heritable<TestEvents>(room, 1);
            room.objects.set(1, object);
            const component = new TestComponent(room, 1, 1);

            let did_receive = false;
            object.on("test.event", ev => {
                if (ev.data.alphabet === alphabet) {
                    did_receive = true;
                }
            });

            await component.emit("test.event", { alphabet });

            assert.ok(did_receive);
        });
    });

    describe("Networkable#owner", () => {
        it("Should return the owner object of the networkable from the room it belongs to.", () => {
            const room = new Hostable();
            const component = new Networkable(room, 1, -2);

            assert.strictEqual(component.owner, room);
        });
    });

    describe("Networkable#Deserialize", () => {
        it("Should do nothing.", () => {
            const room = new Hostable();
            const component = new Networkable(room, 1, -2);

            const reader = HazelBuffer.alloc(0);

            assert.doesNotThrow(() => {
                component.Deserialize(reader);
            });
        });
    });

    describe("Networkable#Serialize", () => {
        it("Should do nothing.", () => {
            const room = new Hostable();
            const component = new Networkable(room, 1, -2);

            const writer = HazelBuffer.alloc(0);

            assert.ok(!component.Serialize(writer));
        });
    });

    describe("Networkable#Preserialize", () => {
        it("Should do nothing.", () => {
            const room = new Hostable();
            const component = new Networkable(room, 1, -2);

            assert.doesNotThrow(() => {
                component.PreSerialize();
            });
        });
    });

    describe("Networkable#HandleRPC", () => {
        it("Should do nothing.", () => {
            const room = new Hostable();
            const component = new Networkable(room, 1, -2);

            assert.doesNotThrow(() => {
                component.HandleRpc({
                    tag: MessageTag.RPC,
                    netid: component.netid,
                    rpcid: RpcTag.PlayAnimation,
                    task: 0,
                });
            });
        });
    });

    describe("Networkable#FixedUpdate", () => {
        it("Should do nothing.", () => {
            const room = new Hostable();
            const component = new Networkable(room, 1, -2);

            assert.doesNotThrow(() => {
                component.FixedUpdate(0);
            });
        });
    });

    describe("Networkable#spawn", () => {
        it("Should spawn itself in the room that it belongs to.", async () => {
            const room = new Hostable();
            const component = new Networkable(room, 1, -2);

            await component.spawn();

            assert.ok(room.netobjects.has(1));
            assert.ok(room.getComponent(1));
        });
    });

    describe("Networkable#despawn", () => {
        it("Should despawn itself in the room that it belongs to.", async () => {
            const room = new Hostable();
            const component = new Networkable(room, 1, -2);

            await component.spawn();
            await component.despawn();

            assert.ok(!room.netobjects.has(1));
            assert.ok(!room.getComponent(1));
        });
    });
});
