import assert from "assert";

import CustomCodePlugin from ".";

import { SkeldjsDummyServer, SkeldjsDummyClient } from "@skeldjs/plugin-testing";

describe("Custom Code Plugin", () => {
    it("Should disconnect the client with a custom message after creating a game.", () => {
        const server = new SkeldjsDummyServer;
        server.load(CustomCodePlugin);
        const client = new SkeldjsDummyClient;

        await client.connect(server);
        await client.host();

        assert.ok(client.disconnected);
    });

    it("Should allow clients to choose the code for their game by creating the game then joining with the code that they want.", () => {
        const server = new SkeldjsDummyServer;
        server.load(CustomCodePlugin);
        const client = new SkeldjsDummyClient;

        await client.connect(server);
        await client.host();

        await client.join("CUSTOM");

        assert.ok(client.room.code === "CUSTOM");
    });

    it("Should allow clients to cancel a game create request by writing CANCEL", () => {
        const server = new SkeldjsDummyServer;
        server.load(CustomCodePlugin);
        const client = new SkeldjsDummyClient;

        await client.connect(server);
        await client.host();

        await client.join("CANCEL");

        assert.ok(!client.room);
    });
});
