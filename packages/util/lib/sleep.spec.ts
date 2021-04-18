import assert from "assert";

import { sleep } from "./sleep";

describe("sleep", () => {
    it("Should wait a specified number of miliseconds asynchronously.", async () => {
        const now = Date.now();
        await sleep(50);

        assert.ok(Date.now() > now + 40);
    });
});
