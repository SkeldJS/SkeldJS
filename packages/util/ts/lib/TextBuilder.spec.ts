import assert from "assert"

import {
    TextBuilder
} from "./TextBuilder"

describe("TextBuilder", () => {
    describe("TextBuilder#link", () => {
        it("Should construct formatted hyperlink text.", () => {
            const builder = new TextBuilder;

            builder
                .link("https://github.com/SkeldJS/SkeldJS")
                .text("Made with SkeldJS")
                .clear();
            
            assert.strictEqual(builder.toString(), "[https://github.com/SkeldJS/SkeldJS]Made with SkeldJS[]");
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

            assert.strictEqual(builder.toString(), "Merry [00ff00ff]christmas[]");
        });
           
        it("Should construct formatted coloured text in hex.", () => {
            const builder = new TextBuilder;
            
            builder
                .reset()
                .text("Merry ")
                .color("ff00ff")
                .text("christmas")
                .clear();
                
            assert.strictEqual(builder.toString(), "Merry [00ff00ff]christmas[]");
        });
    });
});