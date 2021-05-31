import assert from "assert";

import { TextBuilder } from "./TextBuilder";

describe("TextBuilder", () => {
    describe("TextBuilder#reset", () => {
        it("Should reset a text builder to a blank string.", () => {
            const builder = new TextBuilder;

            builder.text("hello").reset();

            assert.strictEqual(builder.toString(), "");
        });
    });

    describe("TextBuilder#clear", () => {
        it("Should clear all applied styles.", () => {
            const builder = new TextBuilder;

            builder
                .text("hello ")
                .tag("https://google.com")
                .text("there")
                .clear()
                .text(" brother");

            assert.strictEqual(
                builder.toString(),
                "hello [https://google.com]there[] brother"
            );
        });
    });

    describe("TextBuilder#link", () => {
        it("Should construct formatted hyperlink text.", () => {
            const builder = new TextBuilder;

            builder
                .link("https://github.com/SkeldJS/SkeldJS")
                .text("Made with SkeldJS")
                .clear();

            assert.strictEqual(
                builder.toString(),
                "[https://github.com/SkeldJS/SkeldJS]Made with SkeldJS[]"
            );
        });

        it("Should throw on an invalid link.", () => {
            const builder = new TextBuilder;

            assert.throws(() => {
                builder.link("github.com").text("Hosted on GitHub").clear();
            });
        });
    });

    describe("TextBuilder#url", () => {
        it("Should use URL as an alias for #link.", () => {
            const builder = new TextBuilder;

            builder
                .url("https://github.com/SkeldJS/SkeldJS")
                .text("Made with SkeldJS")
                .clear();

            assert.strictEqual(
                builder.toString(),
                "[https://github.com/SkeldJS/SkeldJS]Made with SkeldJS[]"
            );
        });
    });

    describe("TextBuilder#color", () => {
        it("Should construct formatted coloured text in RGBA.", () => {
            const builder = new TextBuilder;

            builder
                .text("Merry ")
                .color(0, 255, 0, 255)
                .text("christmas")
                .clear();

            assert.strictEqual(
                builder.toString(),
                "Merry [00ff00ff]christmas[]"
            );
        });

        it("Should construct formatted coloured text in hex.", () => {
            const builder = new TextBuilder;

            builder.text("Merry ").color("00ff00ff").text("christmas").clear();

            assert.strictEqual(
                builder.toString(),
                "Merry [00ff00ff]christmas[]"
            );
        });

        it("Should pad the start of a hex code with 0s.", () => {
            const builder = new TextBuilder;

            builder.text("Skeldjs > ").color("ffff").text("NodePolus").clear();

            assert.strictEqual(
                builder.toString(),
                "Skeldjs > [0000ffff]NodePolus[]"
            );
        });

        it("Should replace invalid hex characters with 0s", () => {
            const builder = new TextBuilder;

            builder.text("Lorem ").color("gg00ff").text("Ipsum").clear();

            assert.strictEqual(builder.toString(), "Lorem [000000ff]Ipsum[]");
        });
    });

    describe("TextBuilder#append", () => {
        it("Should append a second text builder or string onto the end.", () => {
            const builder = new TextBuilder;
            const builder2 = new TextBuilder;

            builder2.text("Ipsum");

            builder.text("Lorem ").append(builder2);

            assert.strictEqual(builder.toString(), "Lorem Ipsum");
        });
    });
});
