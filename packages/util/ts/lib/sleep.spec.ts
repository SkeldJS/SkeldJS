import assert from "assert"

import {
    sleep
} from "./sleep"

describe("Sleep", () => {
    it("Should sleep for a specified number of miliseconds in an asynchronous function.", async () => {
        const before = Date.now();

        await sleep(100);

        assert(Date.now() > before + 50);
    });
});