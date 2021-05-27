import * as f from "./factories";

export type TMPColorName = "black" | "blue" | "green" | "orange" | "purple";

export type TMPTag =
    | "doc"
    | "align"
    | "alpha"
    | "color"
    | "b"
    | "i"
    | "cspace"
    | "font"
    | "indent"
    | "line-height"
    | "line-indent"
    | "link"
    | "lowercase"
    | "uppercase"
    | "smallcaps"
    | "margin"
    | "mark"
    | "mspace"
    | "noparse"
    | "nobr"
    | "page"
    | "pos"
    | "size"
    | "space"
    | "sprite"
    | "s"
    | "u"
    | "style"
    | "sub"
    | "sup"
    | "voffset"
    | "width";

export type TMPNode = TMPElement | string;
export type TMPRGBA = [number, number, number, number];

function formatAttrVal(val: string | number) {
    if (typeof val === "number") return val;

    if (val.includes(" ")) {
        return '"' + val + '"';
    }

    return val;
}

export class TMPElement {
    static SINGLES: TMPTag[] = ["page", "space"];

    children: TMPNode[];

    constructor(
        public readonly tagName: TMPTag,
        public readonly attributes: Record<string, string | number>,
        content?: TMPNode | TMPNode[]
    ) {
        if (Array.isArray(content)) {
            this.children = content ? [...content] : [];
        } else {
            this.children = content ? [content] : [];
        }
    }

    private get is_single() {
        return TMPElement.SINGLES.includes(this.tagName);
    }

    /**
     * Deep clone the tree.
     * @example
     * ```typescript
     * const formatted = tb(color("blue"), italics())
     *   .text("Deep clone!!!");
     *
     * const clone = formatted.clone();
     * ```
     */
    clone(): TMPElement {
        const clattr = { ...this.attributes };
        const children = this.children.map((child) => {
            if (typeof child === "string") {
                return child;
            } else {
                return child.clone();
            }
        });

        return new TMPElement(this.tagName, clattr, children);
    }

    /**
     * Get the representation of the element structure as a string.
     */
    toString() {
        return this.getOuter();
    }

    /**
     * Get the outer representation of the element structure as a string.
     */
    getOuter() {
        return this.getTag() + this.getInner() + this.getClosing();
    }

    /**
     * Get the inner representation of the element structure as a string.
     */
    getInner(): string {
        if (this.is_single) {
            return "";
        }

        return this.children
            .map((child) => {
                if (typeof child === "string") {
                    return child;
                }

                return child.getOuter();
            })
            .join("");
    }

    /**
     * Get the representation of the element attributes as a string.
     */
    getAttributes() {
        const entries = Object.entries(this.attributes);
        const tag_attr = entries.find(([key]) => key === this.tagName);
        if (tag_attr) {
            const attrs = entries
                .filter(([key]) => key !== this.tagName)
                .map(([key, val]) => key + "=" + formatAttrVal(val));

            return (
                this.tagName +
                "=" +
                formatAttrVal(tag_attr[1]) +
                (attrs.length ? attrs.join(" ") : "")
            );
        } else {
            return (
                this.tagName +
                (entries.length
                    ? entries
                          .map(([key, val]) => key + "=" + formatAttrVal(val))
                          .join(" ")
                    : "")
            );
        }
    }

    /**
     * Get the representation of the element tag as a string.
     */
    getTag() {
        if (!this.tagName) {
            return "";
        }

        return "<" + this.getAttributes() + ">";
    }

    /**
     * Get the representation of the element closing tag as a string.
     */
    getClosing() {
        if (!this.tagName) {
            return "";
        }

        if (this.is_single) {
            return "";
        }

        return "</" + this.tagName + ">";
    }

    /**
     * Create a text element.
     * @example
     * ```typescript
     * const formatted = tb().text("text element like a boss");
     * ```
     */
    text(node: TMPNode, parse = false) {
        this.children.push(f.text(node, parse));
        return this;
    }

    /**
     * Set the alignment of the text.
     * @example
     * ```typescript
     * const formatted = tb().align(Align.Center, "center content moment");
     * ```
     */
    align(alignment: f.Align, ...content: TMPNode[]) {
        this.children.push(f.align(alignment, ...content));
        return this;
    }

    /**
     * Set the opacity of the text.
     * @example
     * ```typescript
     * const formatted = tb().alpha("AA");
     * ```
     */
    alpha(opacity: string | number, ...content: TMPNode[]) {
        this.children.push(f.alpha(opacity, ...content));
        return this;
    }

    /**
     * Set the colour of the text
     * @example
     * ```typescript
     * const formatted = tb().color("ff0000ff", "Red text.");
     * ```
     * Or using RGBA:
     * ```typescript
     * const formatted = tb().color([255, 0, 0, 255], "RGBA red text.");
     * ```
     */
    color(
        clr: string | [number, number, number, number],
        ...content: TMPNode[]
    ) {
        this.children.push(f.color(clr, ...content));
        return this;
    }

    /**
     * Make the text bold.
     * @example
     * ```typescript
     * const formatted = tb().bold("bold text....");
     * ```
     */
    bold(...content: TMPNode[]) {
        this.children.push(f.bold(...content));
        return this;
    }

    /**
     * Make the text italic.
     * @example
     * ```typescript
     * const formatted = tb().italics("italic text....");
     * ```
     */
    italics(...content: TMPNode[]) {
        this.children.push(f.italics(...content));
        return this;
    }

    /**
     * Change the spacing relative to normal character spacing.
     * @example
     * ```typescript
     * const formatted = tb().spacing("0.5em", "Spaced out text moment.");
     * ```
     */
    spacing(space: string | number, ...content: TMPNode[]) {
        this.children.push(f.spacing(space, ...content));
        return this;
    }

    /**
     * Change the font face of the text.
     * @example
     * ```typescript
     * const formatted = tb().font("Comic Sans MS", "funeral service.");
     * ```
     */
    font(face: string, ...content: TMPNode[]) {
        this.children.push(f.font(face, ...content));
        return this;
    }

    /**
     * Change the left indentation of the text.
     * @example
     * ```typescript
     * const formatted = tb().indent("5em", "I am indented by 5.");
     * ```
     */
    indent(indentation: string | number, ...content: TMPNode[]) {
        this.children.push(f.indent(indentation, ...content));
        return this;
    }

    /**
     * Change the line height of the text.
     * @example
     * ```typescript
     * const formatted = tb().indent("2em", "I have huge line spacing like a boss.");
     * ```
     */
    lnheight(height: string | number, ...content: TMPNode[]) {
        this.children.push(f.lnheight(height, ...content));
        return true;
    }

    /**
     * Change only the indentation for the first line of the text.
     * @example
     * ```typescript
     * const formatted = tb().indent("2em", "Only this line is indented, any other line will not be indented as displayed by this long piece of text.");
     * ```
     */
    lnindent(indentation: string | number, ...content: TMPNode[]) {
        this.children.push(f.lnindent(indentation, ...content));
        return true;
    }

    /**
     * Create a link to a resource (Not necessarily related to anything).
     * @example
     * ```typescript
     * const formatted = tb().link("https://google.com", "click here to get tracked.");
     * ```
     */
    link(resource: string, ...content: TMPNode[]) {
        this.children.push(f.link(resource, ...content));
        return true;
    }

    /**
     * Force the text to be rendered as lowercase.
     * @example
     * ```typescript
     * const formatted = tb().lowercase("THIS TEXT WILL BE IN LOWERCASE."):
     * ```
     */
    lowercase(...content: TMPNode[]) {
        this.children.push(f.lowercase(...content));
        return this;
    }

    /**
     * Force the text to be rendered as uppercase.
     * @example
     * ```typescript
     * const formatted = tb().uppercase("this text will be in lowercase."):
     * ```
     */
    uppercase(...content: TMPNode[]) {
        this.children.push(f.uppercase(...content));
        return this;
    }

    /**
     * Force the text to be rendered as small caps.
     * @example
     * ```typescript
     * const formatted = tb().smallcaps("This Text Will Be In Small Caps"):
     * ```
     */
    smallcaps(...content: TMPNode[]) {
        this.children.push(f.smallcaps(...content));
        return this;
    }

    /**
     * Change the margin of the text.
     * @example
     * ```typescript
     * const formatted = tb().margin("5em", "Margin text."):
     * ```
     */
    margin(amount: string | number, ...content: TMPNode[]) {
        this.children.push(f.margin(amount, ...content));
    }

    /**
     * Change the background colour of the text.
     * @example
     * ```typescript
     * const formatted = tb().highlight("00ff00aa", "This text has a green background.");
     * ```
     * Or using RGBA:
     * ```typescript
     * const formatted = tb().highlight([0, 255, 0, 255], "This text has a green background.");
     * ```
     */
    highlight(
        color: string | [number, number, number, number],
        ...content: TMPNode[]
    ) {
        this.children.push(f.highlight(color, ...content));
    }

    /**
     * Change the background colour of the text.
     * @example
     * ```typescript
     * const formatted = tb().mark("00ff00aa", "This text has a green background.");
     * ```
     * Or using RGBA:
     * ```typescript
     * const formatted = tb().mark([0, 255, 0, 255], "This text has a green background.");
     * ```
     */
    mark(
        color: string | [number, number, number, number],
        ...content: TMPNode[]
    ) {
        return this.highlight(color, ...content);
    }

    /**
     * Force the text to be rendered monospace.
     * @example
     * ```typescript
     * const formatted = tb().mono("1em", "console.log('Code block.').");
     * ```
     */
    mono(spacing: string | number, ...content: TMPNode[]) {
        this.children.push(f.mono(spacing, ...content));
        return this;
    }

    /**
     * Stop spaces from breaking up text.
     * @example
     * ```typescript
     * const formatted = tb().nbspace("This text does not B R E A K U P")
     * ```
     */
    nbspace(...content: TMPNode[]) {
        this.children.push(f.nbspace(...content));
        return this;
    }

    /**
     * Move to the next page.
     * @example
     * ```typescript
     * const formatted = tb().text("This text").nextpage().text("goes across two pages");
     * ```
     */
    nextpage() {
        this.children.push(f.nextpage());
        return this;
    }

    /**
     * Change the position of the text on the x axis.
     * @example
     * ```typescript
     * const formatted = tb().pos("50%", "I am in the middle of the box.");
     * ```
     */
    pos(x: string | number, ...content: TMPNode[]) {
        this.children.push(f.pos(x, ...content));
        return this;
    }

    /**
     * Change the size of the font.
     * @example
     * ```typescript
     * const formatted = tb().size("150%", "This text is rather large.");
     * ```
     */
    size(size: string | number, ...content: TMPNode[]) {
        this.children.push(f.size(size, ...content));
        return this;
    }

    /**
     * Create a space of a specified size.
     * @example
     * ```typescript
     * const formatted = tb().text("Huge").space("5em").text("space");
     * ```
     */
    space(space: string | number) {
        this.children.push(f.space(space));
        return this;
    }

    /**
     * Create a line through the text.
     * @example
     * ```typescript
     * const formatted = tb().strikethrough("Nevermind");
     * ```
     */
    strikethrough(...content: TMPNode[]) {
        this.children.push(f.strikethrough(...content));
        return this;
    }

    /**
     * Create a line through the text.
     * @example
     * ```typescript
     * const formatted = tb().strike("Nevermind");
     * ```
     */
    strike(...content: TMPNode[]) {
        return this.strikethrough(...content);
    }

    /**
     * Create a line through the text.
     * @example
     * ```typescript
     * const formatted = tb().st("Nevermind");
     * ```
     */
    st(...content: TMPNode[]) {
        return this.strike(...content);
    }

    /**
     * Create a line through the text.
     * @example
     * ```typescript
     * const formatted = tb().s("Nevermind");
     * ```
     */
    s(...content: TMPNode[]) {
        return this.strike(...content);
    }

    /**
     * Create a underline underneath the text.
     * @example
     * ```typescript
     * const formatted = tb().underline("Important text");
     * ```
     */
    underline(...content: TMPNode[]) {
        this.children.push(f.underline(...content));
        return this;
    }

    /**
     * Create a text in subscript.
     * @example
     * ```typescript
     * const formatted = tb().text("log").subscript("2").text("(8) = 3");
     * ```
     */
    subscript(...content: TMPNode[]) {
        this.children.push(f.subscript(...content));
        return this;
    }

    /**
     * Create a text in superscript.
     * @example
     * ```typescript
     * const formatted = tb().text("6").superscript("2").text(" = 36");
     * ```
     */
    superscript(...content: TMPNode[]) {
        this.children.push(f.superscript(...content));
        return this;
    }

    /**
     * Change the vertical offset of the text.
     * @example
     * ```typescript
     * const formatted = tb().voffset("5em", "This text is high up.").voffset(" and this one is low down.");
     * ```
     */
    voffset(offset: string | number, ...content: TMPNode[]) {
        this.children.push(f.voffset(offset, ...content));
        return this;
    }

    /**
     * Change the maximum width of the text before wrapping.
     * @example
     * ```typescript
     * const formatted = tb().width("25%", "This text doesn't go that far :(");
     * ```
     */
    width(width: string | number, ...content: TMPNode[]) {
        this.children.push(f.width(width, ...content));
        return this;
    }
}

export class DocElement extends TMPElement {
    constructor(public boiler: TMPElement[] = []) {
        super("doc", {});
    }

    /**
     * Get the representation of the opening boilerplate tags for the document.
     */
    getBoilerOpen() {
        return this.boiler.map((_) => _.getTag()).join("");
    }

    /**
     * Get the representation of the closing boilerplate tags for the document.
     */
    getBoilerClose() {
        let close = "";
        let i = this.boiler.length;
        while (--i > -1) {
            close += this.boiler[i].getClosing();
        }
        return close;
    }

    getOuter() {
        return this.getBoilerOpen() + this.getInner() + this.getBoilerClose();
    }
}

export const tb = (...nodes: TMPElement[]) => {
    return new DocElement(nodes);
};
