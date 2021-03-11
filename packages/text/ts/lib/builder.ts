import * as f from "./factories";

export type TMPColorName = "black"|"blue"|"green"|"orange"|"purple";

export type TMPTag = "doc"|"align"|"alpha"|"color"|"b"|"i"|"cspace"|"font"|"indent"|"line-height"|"line-indent"|"link"|"lowercase"|"uppercase"|"smallcaps"|"margin"|
    "mark"|"mspace"|"noparse"|"nobr"|"page"|"pos"|"size"|"space"|"sprite"|"s"|"u"|"style"|"sub"|"sup"|"voffset"|"width";

export type TMPNode = TMPElement|string;
export type TMPRGBA = [ number, number, number, number ];
export class TMPElement {
    static SINGLES: TMPTag[] = ["page"];

    children: TMPNode[];

    constructor(
        public readonly tagName: TMPTag,
        public readonly attributes: Record<string, string|number>,
        content?: TMPNode|TMPNode[]
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
     */
    clone() {
        const clattr = { ...this.attributes };
        const children = this.children.map(child => {
            if (typeof child === "string") {
                return child;
            } else {
                return child.clone();
            }
        });

        return new TMPElement(this.tagName, clattr, children);
    }

    toString() {
        return this.getOuter();
    }

    getOuter() {
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

            return this.tagName + "=\"" + tag_attr[1] + "\"" + (attrs.length ? attrs.join(" ") : "");
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
        this.children.push(f.text(node));
        return this;
    }

    align(alignment: f.Align, ...content: TMPNode[]) {
        this.children.push(f.align(alignment, ...content));
        return this;
    }

    alpha(opacity: string|number, ...content: TMPNode[]) {
        this.children.push(f.alpha(opacity, ...content));
        return this;
    }

    color(clr: string|[number, number, number, number], ...content: TMPNode[]) {
        this.children.push(f.color(clr, ...content));
        return this;
    }

    bold(...content: TMPNode[]) {
        this.children.push(f.bold(...content));
        return this;
    }

    italics(...content: TMPNode[]) {
        this.children.push(f.italics(...content));
        return this;
    }

    spacing(space: string|number, ...content: TMPNode[]) {
        this.children.push(f.spacing(space, ...content));
        return this;
    }

    font(face: string, ...content: TMPNode[]) {
        this.children.push(f.font(face, ...content));
        return this;
    }

    indent(indentation: string|number, ...content: TMPNode[]) {
        this.children.push(f.indent(indentation, ...content));
        return this;
    }

    lnheight(height: string|number, ...content: TMPNode[]) {
        this.children.push(f.lnheight(height, ...content));
        return true;
    }

    lnindent(indentation: string|number, ...content: TMPNode[]) {
        this.children.push(f.lnindent(indentation, ...content));
        return true;
    }

    link(resource: string, ...content: TMPNode[]) {
        this.children.push(f.link(resource, ...content));
        return true;
    }

    lowercase(...content: TMPNode[]) {
        this.children.push(f.lowercase(...content));
        return this;
    }

    uppercase(...content: TMPNode[]) {
        this.children.push(f.uppercase(...content));
        return this;
    }

    smallcaps(...content: TMPNode[]) {
        this.children.push(f.smallcaps(...content));
        return this;
    }

    margin(amount: string|number, ...content: TMPNode[]) {
        this.children.push(f.margin(amount, ...content));
    }

    highlight(color: string|[number, number, number, number], ...content: TMPNode[]) {
        this.children.push(f.highlight(color, ...content));
    }

    mark(color: string|[number, number, number, number], ...content: TMPNode[]) {
        return this.highlight(color, ...content);
    }

    mono(spacing: string|number, ...content: TMPNode[]) {
        this.children.push(f.mono(spacing, ...content));
        return this;
    }

    nbspace(...content: TMPNode[]) {
        this.children.push(f.nbspace(...content));
        return this;
    }

    nextpage() {
        this.children.push(f.nextpage());
        return this;
    }

    pos(x: string|number, ...content: TMPNode[]) {
        this.children.push(f.pos(x, ...content));
        return this;
    }

    size(size: string|number, ...content: TMPNode[]) {
        this.children.push(f.size(size, ...content));
        return this;
    }

    space(space: string|number, ...content: TMPNode[]) {
        this.children.push(f.space(space, ...content));
        return this;
    }

    strikethrough(...content: TMPNode[]) {
        this.children.push(f.strikethrough(...content));
        return this;
    }

    strike(...content: TMPNode[]) {
        return this.strikethrough(...content);
    }

    st(...content: TMPNode[]) {
        return this.strike(...content);
    }

    s(...content: TMPNode[]) {
        return this.strike(...content);
    }

    underline(...content: TMPNode[]) {
        this.children.push(f.underline(...content));
        return this;
    }

    subscript(...content: TMPNode[]) {
        this.children.push(f.subscript(...content));
        return this;
    }

    superscript(...content: TMPNode[]) {
        this.children.push(f.superscript(...content));
        return this;
    }

    voffset(offset: string|number, ...content: TMPNode[]) {
        this.children.push(f.voffset(offset, ...content));
        return this;
    }

    width(width: string|number, ...content: TMPNode[]) {
        this.children.push(f.width(width, ...content));
        return this;
    }
}

export class DocElement extends TMPElement {
    constructor(public boiler: TMPElement[]) {
        super("doc", {});
    }

    getBoilerOpen() {
        return this.boiler.map(_ => _.getTag()).join("");
    }

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
