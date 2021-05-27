const hex = (h: number) => h.toString(16).padStart(2, "0");

export class TextBuilder {
    private _str: string;

    constructor() {
        this._str = "";
    }

    toString() {
        return this._str;
    }

    /**
     * Write plain text.
     */
    text(str: string) {
        this._str += str;

        return this;
    }

    append(text: TextBuilder | string) {
        this._str += text.toString();

        return this;
    }

    /**
     * Create a text tag (color, link)
     */
    tag(content: string) {
        this._str += "[" + content + "]";

        return this;
    }

    /**
     * Set the text color.
     */
    color(hex: string): TextBuilder;
    color(r: number, g: number, b: number, a: number): TextBuilder;
    color(r: string | number, g?: number, b?: number, a?: number): TextBuilder {
        if (typeof r === "string") {
            if (!/^[a-fA-F0-9]+$/.test(r)) {
                return this.color(r.replace(/[^a-fA-F0-9]/g, "0"));
            }

            const hexclr = r.padStart(8, "0");

            this.tag(hexclr);
        } else if (typeof r === "number") {
            const hexclr = hex(r) + hex(g || 0) + hex(b || 0) + hex(a || 0);

            this.tag(hexclr);
        }

        return this;
    }

    /**
     * Reset the builder to a blank string.
     */
    reset() {
        this._str = "";

        return this;
    }

    /**
     * Clear all styles (color, link).
     */
    clear() {
        this.tag("");

        return this;
    }

    /**
     * Write a clickable link.
     * @param url A URL to link to, must begin with http.
     */
    link(url: string) {
        if (url.startsWith("http")) {
            this._str += "[" + url + "]";
        } else {
            throw new Error("TextBuilder: Invalid URL (must start with http).");
        }

        return this;
    }

    /**
     * Write a clickable link.
     * @param url A URL to link to, must begin with http.
     */
    url(url: string) {
        return this.link(url);
    }
}
