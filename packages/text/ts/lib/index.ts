export type TextAlignment = "left"|"center"|"right";

export type ColorName = "black"|"blue"|"green"|"orange"|"purple";

export type TMPTag = "doc"|"text"|"align"|"alpha"|"color"|"b"|"i"|"cspace"|"font"|"indent"|"line-height"|"line-indent"|"link"|"lowercase"|"uppercase"|"smallcaps"|"margin"|
    "mark"|"mspace"|"noparse"|"nobr"|"page"|"pos"|"size"|"space"|"sprite"|"s"|"u"|"style"|"sub"|"sup"|"voffset"|"width";

const hex = (h: number) => h.toString(16).padStart(2, "0");

export class TMPElement {
    children: TMPElement[];

    constructor(public readonly parent: TMPElement, public readonly tagName: TMPTag) {
        this.children = [];
    }

    get attributes(): Record<string, string> {
        return {};
    }

    toString() {
        return this.getOuter();
    }

    getInner(): string {
        return this.children.map(child => child.getOuter()).join("");
    }

    getTag(): string {
        const entries = Object.entries(this.attributes);
        const tag_attr = entries.find(([ key ]) => key === this.tagName);
        if (tag_attr) {
            const attrs = entries.filter(([ key ]) => key !== this.tagName).map(([key, val]) => key + "=" + val);

            return "<" + this.tagName + "=" + tag_attr[1] + (attrs.length ? attrs.join(" ") : "") + ">";
        } else {
            return "<" + this.tagName + (entries.length ? entries.map(([ key, val ]) => key + "=" + val).join(" ") : "") + ">";
        }
    }

    getClose(): string {
        return "</" + this.tagName + ">";
    }

    getOuter(): string {
        return this.getTag() + this.getInner() + this.getClose();
    }

    getStripped() {
        return this.children.map(child => child.getStripped()).join("");
    }
}

export class TMPTextElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public text: string) {
        super(parent, "text");
    }

    getTag() {
        return "";
    }

    getClose() {
        return "";
    }

    getInner() {
        return this.text;
    }

    getOuter() {
        return this.text;
    }

    getRaw() {
        return this.text;
    }

    getRawOuter() {
        return this.text;
    }

    getStripped() {
        return this.text;
    }
}

export class TMPAlignElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public align: TextAlignment) {
        super(parent, "align");
    }

    get attributes() {
        return { align: this.align };
    }
}

export class TMPAlphaElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public alpha: string) {
        super(parent, "alpha");
    }

    get attributes() {
        return { alpha: this.alpha };
    }
}

export class TMPColorElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public color: string) {
        super(parent, "color");
    }

    get attributes() {
        return { color: this.color };
    }
}

export class TMPBoldElement extends TMPElement {
    constructor(public readonly parent: TMPElement) {
        super(parent, "b");
    }
}

export class TMPItalicsElement extends TMPElement {
    constructor(public readonly parent: TMPElement) {
        super(parent, "i");
    }
}

export class TMPCSpaceElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public spacing: string) {
        super(parent, "cspace");
    }

    get attributes() {
        return { cspace: this.spacing };
    }
}

export class TMPFontElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public family: string) {
        super(parent, "font");
    }

    get attributes() {
        return { font: this.family };
    }
}

export class TMPIndentationElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public indent: string) {
        super(parent, "indent");
    }

    get attributes() {
        return { indent: this.indent };
    }
}

export class TMPLineHeightElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public lineHeight: string) {
        super(parent, "line-height");
    }

    get attributes() {
        return { "line-height": this.lineHeight };
    }
}

export class TMPLineIndentElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public indent: string) {
        super(parent, "line-indent");
    }

    get attributes() {
        return { "line-indent": this.indent };
    }
}

export class TMPLinkElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public resource: string) {
        super(parent, "link");
    }

    get attributes() {
        return { link: this.resource };
    }
}

export class TMPLowercaseElement extends TMPElement {
    constructor(public readonly parent: TMPElement) {
        super(parent, "lowercase");
    }
}

export class TMPUppercaseElement extends TMPElement {
    constructor(public readonly parent: TMPElement) {
        super(parent, "uppercase");
    }
}

export class TMPSmallcapsElement extends TMPElement {
    constructor(public readonly parent: TMPElement) {
        super(parent, "smallcaps");
    }
}

export class TMPMarginElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public margin: string) {
        super(parent, "margin");
    }

    get attributes() {
        return { margin: this.margin };
    }
}

export class TMPMarkElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public highlight: string) {
        super(parent, "mark");
    }

    get attributes() {
        return { mark: this.highlight };
    }
}

export class TMPMonospaceElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public spacing: string) {
        super(parent, "mspace");
    }

    get attributes() {
        return { spacing: this.spacing };
    }
}

export class TMPNoParseElement extends TMPElement {
    constructor(public readonly parent: TMPElement) {
        super(parent, "noparse");
    }

    getStripped() {
        return this.getInner();
    }
}

export class TMPNbspElement extends TMPElement {
    constructor(public readonly parent: TMPElement) {
        super(parent, "nobr");
    }
}

export class TMPPageBreakElement extends TMPElement {
    constructor(public readonly parent: TMPElement) {
        super(parent, "page");
    }

    getClose() {
        return "";
    }
}

export class TMPHorizPosElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public pos: string) {
        super(parent, "pos");
    }

    get attributes() {
        return { pos: this.pos };
    }
}

export class TMPFontSizeElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public size: string) {
        super(parent, "size");
    }

    get attributes() {
        return { size: this.size };
    }
}

export class TMPHorizSpaceElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public spacing: string) {
        super(parent, "space");
    }

    get attributes() {
        return { spacing: this.spacing };
    }
}

export class TMPSpriteElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public sprite?: string|number, public asset?: string, public tint?: boolean, public color?: string) {
        super(parent, "sprite");
    }

    get attributes() {
        const asset_obj = this.asset ? {} : { sprite: this.asset };

        if (typeof this.sprite === "string") {
            return {
                name: this.sprite,
                tint: this.tint ? "true" : "false",
                color: this.color,
                ...asset_obj
            };
        } else {
            return {
                index: ""+this.sprite,
                tint: this.tint ? "true" : "false",
                color: this.color,
                ...asset_obj
            };
        }
    }
}

export class TMPStrikethroughElement extends TMPElement {
    constructor(public readonly parent: TMPElement, ) {
        super(parent, "s");
    }
}

export class TMPUnderlineElement extends TMPElement {
    constructor(public readonly parent: TMPElement, ) {
        super(parent, "u");
    }
}

export class TMPStyleElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public style: string) {
        super(parent, "style");
    }

    get attributes() {
        return {
            style: this.style
        };
    }
}

export class TMPSubscriptElement extends TMPElement {
    constructor(public readonly parent: TMPElement, ) {
        super(parent, "sub");
    }
}

export class TMPSuperscriptElement extends TMPElement {
    constructor(public readonly parent: TMPElement, ) {
        super(parent, "sup");
    }
}

export class TMPVerticalOffsetElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public offset: string) {
        super(parent, "voffset");
    }

    get attributes() {
        return { offset: this.offset };
    }
}

export class TMPTextWidthElement extends TMPElement {
    constructor(public readonly parent: TMPElement, public width: string) {
        super(parent, "width");
    }

    get attributes() {
        return { width: this.width };
    }
}

export class TextBuilder extends TMPElement {
    private current: TMPElement;

    constructor() {
        super(null, "doc");
        this.current = this;
    }

    getOuter() {
        return this.getInner();
    }

    close() {
        if (!this.current.parent) {
            throw new TypeError("Cannot close root tag.");
        }

        this.current = this.current.parent;
        return this;
    }

    single(element: TMPElement) {
        this.children.push(element);
    }

    open(element: TMPElement) {
        this.current.children.push(element);
        this.current = element;
        return this;
    }

    private _text(text: string) {
        this.current.children.push(new TMPTextElement(this.current, text));
        return this;
    }

    text(text: string) {
        if (/[<>]/.test(text)) {
            this.open(new TMPNoParseElement(this.current));
            this._text(text);
            this.close();
        }

        return this._text(text);
    }

    /**
     * Set the text alignment.
     */
    align(alignment: TextAlignment) {
        return this.open(new TMPAlignElement(this.current, alignment));
    }

    /**
     * Set the text opacity.
     */
    alpha(value: string);
    alpha(value: number);
    alpha(value: string | number) {
        if (typeof value === "string") {
            if (value[value.length - 1] === "%") {
                return this.alpha(parseInt(value) * 2.55);
            }

            if (value[0] === "#") {
                return this.alpha(value.slice(1));
            }

            const hexclr = value.padStart(2, "0");
            return this.open(new TMPAlphaElement(this.current, hexclr));
        } else {
            return this.alpha(value.toString(16));
        }
    }

    /**
     * Set the text color.
     */
    color(hex: string): TextBuilder;
    color(r: number, g: number, b: number, a: number): TextBuilder;
    color(r: string | number, g?: number, b?: number, a?: number): TextBuilder {
        if (typeof r === "string") {
            if (r[0] === "#") {
                return this.color(r.slice(1));
            }

            if (!/^[a-fA-F0-9]+$/.test(r)) {
                return this.color(r.replace(/[^a-fA-F0-9]/g, "0"));
            }

            const hexclr = r.padStart(8, "0");

            return this.open(new TMPColorElement(this.current, hexclr));
        } else if (typeof r === "number") {
            const hexclr = hex(r) + hex(g) + hex(b) + hex(a);

            return this.color(hexclr);
        }
    }

    /**
     * Set the text bold.
     */
    bold() {
        return this.open(new TMPBoldElement(this.current));
    }

    /**
     * Set the text italic.
     */
    italic() {
        return this.open(new TMPItalicsElement(this.current));
    }

    /**
     * Change the spacing between individual characters relative to their normal spacing.
     */
    charSpacing(spacing: string|number) {
        if (typeof spacing === "string") {
            return this.open(new TMPCSpaceElement(this.current, spacing));
        } else {
            return this.charSpacing(spacing + "px");
        }
    }

    /**
     * Set the font.
     */
    font(family: string) {
        return this.open(new TMPFontElement(this.current, family));
    }

    /**
     * Set the indentation of the text.
     */
    indent(indent: string|number) {
        if (typeof indent === "string") {
            return this.open(new TMPIndentationElement(this.current, indent));
        } else {
            return this.indent(indent + "px");
        }
    }

    /**
     * Set the height of each line.
     */
    lineHeight(height: string|number) {
        if (typeof height === "string") {
            return this.open(new TMPLineHeightElement(this.current, height));
        } else {
            return this.lineHeight(height + "px");
        }
    }

    /**
     * Create a link to a resource.
     */
    link(resource: string) {
        return this.open(new TMPLinkElement(this.current, resource));
    }

    /**
     * Make all text lowercase.
     */
    lowercase() {
        return this.open(new TMPLowercaseElement(this.current));
    }

    /**
     * Make all text uppercase.
     */
    uppercase() {
        return this.open(new TMPUppercaseElement(this.current));
    }

    /**
     * Make all text small caps.
     */
    smallcaps() {
        return this.open(new TMPSmallcapsElement(this.current));
    }

    /**
     * Set the margin for the text.
     */
    margin(margin: string|number) {
        if (typeof margin === "string") {
            return this.open(new TMPMarginElement(this.current, margin));
        } else {
            return this.margin + "px";
        }
    }

    /**
     * Highlight a section of text with a specified colour.
     */
    highlight(hex: string): TextBuilder;
    highlight(r: number, g: number, b: number, a: number): TextBuilder;
    highlight(r: string | number, g?: number, b?: number, a?: number): TextBuilder {
        if (typeof r === "string") {
            if (r[0] === "#") {
                return this.color(r.slice(1));
            }

            if (!/^[a-fA-F0-9]+$/.test(r)) {
                return this.color(r.replace(/[^a-fA-F0-9]/g, "0"));
            }

            const hexclr = r.padStart(8, "0");

            return this.open(new TMPMarkElement(this.current, hexclr));
        } else if (typeof r === "number") {
            const hexclr = hex(r) + hex(g) + hex(b) + hex(a);

            return this.color(hexclr);
        }
    }

    /**
     * Highlight a section of text with a specified colour.
     */
    mark(hex: string): TextBuilder;
    mark(r: number, g: number, b: number, a: number): TextBuilder;
    mark(r: string | number, g?: number, b?: number, a?: number): TextBuilder {
        if (typeof r === "string") {
            return this.highlight(r);
        } else {
            return this.highlight(r, g, b, a);
        }
    }

    /**
     * Make each character have the same spacing.
     */
    monospace(spacing: string|number) {
        if (typeof spacing === "string") {
            return this.open(new TMPMonospaceElement(this.current, spacing));
        } else {
            return this.monospace(spacing + "px");
        }
    }

    /**
     * Make a section with non-breaking spaces.
     */
    nbspace() {
        return this.open(new TMPNbspElement(this.current));
    }

    /**
     * Create a page break.
     */
    nextpage() {
        return this.single(new TMPPageBreakElement(this.current));
    }

    /**
     * Change the horizontal position of the text.
     */
    pos(x: string|number) {
        if (typeof x == "string") {
            return this.open(new TMPHorizPosElement(this.current, x));
        } else {
            return this.pos(x + "px");
        }
    }

    /**
     * Change the font size.
     */
    size(size: string|number) {
        if (typeof size === "string") {
            return this.open(new TMPFontSizeElement(this.current, size));
        } else {
            return this.size(size + "px");
        }
    }

    /**
     * Add a space of a specified number of pixels.
     */
    space(space: string|number) {
        if (typeof space === "string") {
            return this.open(new TMPHorizSpaceElement(this.current, space));
        } else {
            return this.space(space + "px");
        }
    }

    strikethrough() {
        return this.open(new TMPStrikethroughElement(this.current));
    }

    underline() {
        return this.open(new TMPUnderlineElement(this.current));
    }

    subscript() {
        return this.open(new TMPSubscriptElement(this.current));
    }

    superscript() {
        return this.open(new TMPSuperscriptElement(this.current));
    }

    voffset(offset: string|number) {
        if (typeof offset === "string") {
            return this.open(new TMPVerticalOffsetElement(this.current, offset));
        } else {
            return this.voffset(offset + "px");
        }
    }

    width(width: string|number) {
        if (typeof width === "string") {
            return this.open(new TMPTextWidthElement(this.current, width));
        } else {
            return this.width(width + "px");
        }
    }
}
