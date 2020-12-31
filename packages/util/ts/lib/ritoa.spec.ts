import assert from "assert"

import {
    ritoa
} from "./ritoa"

describe("riota", () => {
    it("Should convert an object containing an address and port into a string.", () => {
        assert.strictEqual(ritoa({
            address: "127.0.0.1",
            port: 22023
        }), "127.0.0.1:22023");
    });
});