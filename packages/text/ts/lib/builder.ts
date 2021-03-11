

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
        this.children.push(text(node));
        return this;
    }

    align(alignment: Align, content: TMPNode) {
        this.children.push(align(alignment, content));
        return this;
    }

    alpha(opacity: string|number, content: TMPNode) {
        this.children.push(alpha(opacity, content));
        return this;
    }

    color(clr: string|[number, number, number, number], content: TMPNode) {
        this.children.push(color(clr, content));
        return this;
    }

    bold(content: TMPNode) {
        this.children.push(bold(content));
        return this;
    }

    italics(content: TMPNode) {
        this.children.push(italics(content));
        return this;
    }

    spacing(space: string|number, content: TMPNode) {
        this.children.push(spacing(space, content));
        return this;
    }

    font(face: string, content: TMPNode) {
        this.children.push(font(face, content));
        return this;
    }

    indent(indentation: string|number, content: TMPNode) {
        this.children.push(indent(indentation, content));
        return this;
    }

    lnheight(height: string|number, content: TMPNode) {
        this.children.push(lnheight(height, content));
        return true;
    }

    lnindent(indentation: string|number, content: TMPNode) {
        this.children.push(lnindent(indentation, content));
        return true;
    }

    link(resource: string, content: TMPNode) {
        this.children.push(link(resource, content));
        return true;
    }

    lowercase(content: TMPNode) {
        this.children.push(lowercase(content));
        return this;
    }

    uppercase(content: TMPNode) {
        this.children.push(uppercase(content));
        return this;
    }

    smallcaps(content: TMPNode) {
        this.children.push(smallcaps(content));
        return this;
    }

    margin(amount: string|number, content: TMPNode) {
        this.children.push(margin(amount, content));
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
