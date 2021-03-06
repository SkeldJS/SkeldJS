import assert from "assert";

import { ritoa } from "./ritoa";

describe("riota", () => {
    it("Should convert an object containing an address and port into a string.", () => {
        assert.strictEqual(
            ritoa({
                address: "127.0.0.1",
                port: 22023,
            }),
            "127.0.0.1:22023"
        );
    });

    it("Should convert an object containing an object containing remote info (e.g. a client object) into a string.", () => {
        assert.strictEqual(
            ritoa({
                remote: {
                    address: "192.168.0.1",
                    port: 22023,
                    family: "IPv4",
                    size: 0,
                },
            }),
            "192.168.0.1:22023"
        );
    });
});
