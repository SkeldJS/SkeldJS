import { TMPElement, TMPNode } from "./builder";

export enum Align {
    Left = "left",
    Center = "center",
    Right = "right"
}

const hex = (h: number) => h.toString(16).padStart(2, "0");

export function text(node: TMPNode) {
    if (typeof node === "string") {
        if (node.includes("<")) {
            return new TMPElement("noparse", {}, node);
        } else {
            return node;
        }
    }

    return new TMPElement("noparse", {}, node);
}

export function align(align: Align, ...content: TMPNode[]) {
    return new TMPElement("align", { align }, content);
}

export function alpha(alpha: string|number, ...content: TMPNode[]) {
    return new TMPElement("alpha", { alpha }, content);
}

export function color(color: string|[number, number, number, number], ...content: TMPNode[]) {
    if (typeof color === "string") {
        return new TMPElement("color", { color }, content);
    }

    const [ r, g, b, a ] = color;
    return this.color(hex(r) + hex(g) + hex(b) + hex(a), ...content);
}

export function bold(...content: TMPNode[]) {
    return new TMPElement("b", {}, content);
}

export { bold as b };

export function italics(...content: TMPNode[]) {
    return new TMPElement("i", {}, content);
}

export { italics as i };

export function spacing(spacing: string|number, ...content: TMPNode[]) {
    return new TMPElement("cspace", { cspace: spacing }, content);
}

export { spacing as cspace };

export function font(face: string, ...content: TMPNode[]) {
    return new TMPElement("font", { font: face }, content);
}

export function indent(indent: string|number, ...content: TMPNode[]) {
    return new TMPElement("indent", { indent }, content);
}

export function lnheight(height: string|number, ...content: TMPNode[]) {
    return new TMPElement("line-height", { "lineheight": height }, content);
}

export function lnindent(indent: string|number, ...content: TMPNode[]) {
    return new TMPElement("line-indent", { "line-indent": indent }, content);
}

export function link(resource: string, ...content: TMPNode[]) {
    return new TMPElement("link", { link: resource }, content);
}

export function lowercase(...content: TMPNode[]) {
    return new TMPElement("lowercase", {}, content);
}

export function uppercase(...content: TMPNode[]) {
    return new TMPElement("uppercase", {}, content);
}

export function smallcaps(...content: TMPNode[]) {
    return new TMPElement("smallcaps", {}, content);
}

export function margin(margin: string|number, ...content: TMPNode[]) {
    return new TMPElement("margin", { margin }, content);
}

export function highlight(color: string|[number, number, number, number], ...content: TMPNode[]) {
    if (typeof color === "string") {
        return new TMPElement("mark", { mark: color }, content);
    }

    const [ r, g, b, a ] = color;
    return highlight(hex(r) + hex(g) + hex(b) + hex(a), ...content);
}

export { highlight as mark };

export function monospace(spacing: string|number, ...content: TMPNode[]) {
    return new TMPElement("mspace", { mspace: spacing }, content);
}

export { monospace as mono };

export function nbspace(...content: TMPNode[]) {
    return new TMPElement("nobr", {}, content);
}

export function nextpage() {
    return new TMPElement("page", {});
}

export function pos(x: string|number, ...content: TMPNode[]) {
    return new TMPElement("pos", { pos: x }, content);
}

export function size(size: string|number, ...content: TMPNode[]) {
    return new TMPElement("size", { size }, content);
}

export function space(space: string|number, ...content: TMPNode[]) {
    return new TMPElement("space", { space }, content);
}

export function strikethrough(...content: TMPNode[]) {
    return new TMPElement("s", {}, content);
}

export { strikethrough as strike, strikethrough as st, strikethrough as s};

export function underline(...content: TMPNode[]) {
    return new TMPElement("u", {}, content);
}

export { underline as u };

export function subscript(...content: TMPNode[]) {
    return new TMPElement("sub", {}, content);
}

export { subscript as sub };

export function superscript(...content: TMPNode[]) {
    return new TMPElement("sup", {}, content);
}

export { superscript as sup };

export function voffset(offset: string|number, ...content: TMPNode[]) {
    return new TMPElement("voffset", { voffset: offset }, content);
}

export function width(width: string|number, ...content: TMPNode[]) {
    return new TMPElement("width", { width }, content);
}
