export enum Align {
    Left = "left",
    Center = "center",
    Right = "right"
}

export type TMPColorName = "black"|"blue"|"green"|"orange"|"purple";

export type TMPTag = "doc"|"align"|"alpha"|"color"|"b"|"i"|"cspace"|"font"|"indent"|"line-height"|"line-indent"|"link"|"lowercase"|"uppercase"|"smallcaps"|"margin"|
    "mark"|"mspace"|"noparse"|"nobr"|"page"|"pos"|"size"|"space"|"sprite"|"s"|"u"|"style"|"sub"|"sup"|"voffset"|"width";

export type TMPNode = TMPElement|string;
export type TMPRGBA = [ number, number, number, number ];

const hex = (h: number) => h.toString(16).padStart(2, "0");

export class TMPElement {
    static SINGLES: TMPTag[] = ["page"];

    children: TMPNode[];

    constructor(
        public readonly tagName: TMPTag,
        public readonly attributes: Record<string, string|number>,
        content?: TMPNode
    ) {
        this.children = content ? [content] : [];
    }

    private get is_single() {
        return TMPElement.SINGLES.includes(this.tagName);
    }

    toString() {
        return this.getOuter();
    }

    getOuter() {
        if (this.tagName === "doc") {
            return this.getInner();
        }

        return this.getTag() + this.getInner() + this.getClosing();
    }

    getInner() {
        return this.children.map(child => {
            if (typeof child === "string") {
                return child;
            }

            return child.getOuter();
        }).join("");
    }

    getAttributes() {
        const entries = Object.entries(this.attributes);
        const tag_attr = entries.find(([ key ]) => key === this.tagName);
        if (tag_attr) {
            const attrs = entries.filter(([ key ]) => key !== this.tagName).map(([key, val]) => key + "=\"" + val + "\"");

            return this.tagName + "=" + tag_attr[1] + (attrs.length ? attrs.join(" ") : "");
        } else {
            return this.tagName + (entries.length ? entries.map(([ key, val ]) => key + "=\"" + val + "\"").join(" ") : "");
        }
    }

    getTag() {
        if (!this.tagName) {
            return "";
        }

        if (this.is_single) {
            return "<" + this.getAttributes() + "/>";
        }

        return "<" + this.getAttributes() + ">";
    }

    getClosing() {
        if (!this.tagName) {
            return "";
        }

        if (this.is_single) {
            return "";
        }

        return "</" + this.tagName + ">";
    }

    text(node: TMPNode) {
        if (typeof node === "string") {
            if (node.includes("<")) {
                this.children.push(new TMPElement("noparse", {}, node));
                return this;
            }
        }

        this.children.push(node);
        return this;
    }

    align(align: Align, content: TMPNode) {
        this.children.push(new TMPElement("align", { align }, content));
        return this;
    }

    alpha(alpha: string|number, content: TMPNode) {
        this.children.push(new TMPElement("alpha", { alpha }, content));
        return this;
    }

    color(color: string|[number, number, number, number], content: TMPNode) {
        if (typeof color === "string") {
            this.children.push(new TMPElement("color", { color }, content));
            return this;
        }

        const [ r, g, b, a ] = color;
        return this.color(hex(r) + hex(g) + hex(b) + hex(a), content);
    }

    bold(content: TMPNode) {
        this.children.push(new TMPElement("b", {}, content));
        return this;
    }

    italics(content: TMPNode) {
        this.children.push(new TMPElement("i", {}, content));
        return this;
    }

    spacing(spacing: string|number, content: TMPNode) {
        this.children.push(new TMPElement("cspace", { cpsace: spacing }, content));
        return this;
    }

    font(face: string, content: TMPNode) {
        this.children.push(new TMPElement("font", { font: face }, content));
        return this;
    }

    indent(indent: string|number, content: TMPNode) {
        this.children.push(new TMPElement("indent", { indent }, content));
        return this;
    }

    lnheight(height: string|number, content: TMPNode) {
        this.children.push(new TMPElement("line-height", { "line-height": height }, content));
        return true;
    }

    lnindent(height: string|number, content: TMPNode) {
        this.children.push(new TMPElement("line-indent", { "line-indent": height }, content));
        return true;
    }

    link(resource: string, content: TMPNode) {
        this.children.push(new TMPElement("link", { link: resource }, content));
        return true;
    }

    lowercase(content: TMPNode) {
        this.children.push(new TMPElement("lowercase", {}, content));
        return this;
    }

    uppercase(content: TMPNode) {
        this.children.push(new TMPElement("uppercase", {}, content));
        return this;
    }

    smallcaps(content: TMPNode) {
        this.children.push(new TMPElement("smallcaps", {}, content));
        return this;
    }

    margin(margin: string|number, content: TMPNode) {
        this.children.push(new TMPElement("margin", { margin }, content));
    }

    highlight(color: string|[number, number, number, number], content: TMPNode) {
        if (typeof color === "string") {
            this.children.push(new TMPElement("mark", { mark: color }, content));
            return this;
        }

        const [ r, g, b, a ] = color;
        return hex(r) + hex(g) + hex(b) + hex(a);
    }

    mark(color: string|[number, number, number, number], content: TMPNode) {
        return this.highlight(color, content);
    }

    mono(spacing: string|number, content: TMPNode) {
        this.children.push(new TMPElement("mspace", { mspace: spacing }, content));
        return this;
    }

    nbspace(content: TMPNode) {
        this.children.push(new TMPElement("nobr", {}, content));
        return this;
    }

    nextpage() {
        this.children.push(new TMPElement("page", {}));
        return this;
    }

    pos(x: string|number, content: TMPNode) {
        this.children.push(new TMPElement("pos", { pos: x }, content));
        return this;
    }

    size(size: string|number, content: TMPNode) {
        this.children.push(new TMPElement("size", { size }, content));
        return this;
    }

    space(space: string|number, content: TMPNode) {
        this.children.push(new TMPElement("space", { space }, content));
        return this;
    }

    strikethrough(content: TMPNode) {
        this.children.push(new TMPElement("s", {}, content));
        return this;
    }

    underline(content: TMPNode) {
        this.children.push(new TMPElement("u", {}, content));
        return this;
    }

    subscript(content: TMPNode) {
        this.children.push(new TMPElement("sub", {}, content));
        return this;
    }

    superscript(content: TMPNode) {
        this.children.push(new TMPElement("sup", {}, content));
        return this;
    }

    voffset(offset: string|number, content: TMPNode) {
        this.children.push(new TMPElement("voffset", { voffset: offset }, content));
        return this;
    }

    width(width: string|number, content: TMPNode) {
        this.children.push(new TMPElement("width", { width }, content));
        return this;
    }
}

export const tb = () => new TMPElement(null, {});
