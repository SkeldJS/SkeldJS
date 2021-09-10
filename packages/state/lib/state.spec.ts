import assert from "assert";

import { SkeldjsStateManager } from "./state";

describe("SkeldjsStateManager", () => {
    describe("#handleMessage", () => {
        it("Should handle a raw data buffer, deserialise and update state accordingly.", async () => {
            const state = new SkeldjsStateManager;
            await state.handleInboundMessage(
                Buffer.from("0100010400007338818c", "hex")
            );

            assert.strictEqual(state.code, -1937688461);

            await state.handleInboundMessage(
                Buffer.from(
                    "0100020d00077338818c74060000740600000006000a7338818c0100",
                    "hex"
                )
            );

            assert.strictEqual(state.clientId, 1652);
            assert.strictEqual(state.hostId, 1652);
        });
    });
});
