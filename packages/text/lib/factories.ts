import { TMPElement, TMPNode } from "./builder";

export enum Align {
    Left = "left",
    Center = "center",
    Right = "right",
}

const hex = (h: number) => h.toString(16).padStart(2, "0");

/**
 * Create a text element.
 */
export function text(node: TMPNode, parse = false) {
    if (typeof node === "string") {
        if (node.includes("<") && !parse) {
            return new TMPElement("noparse", {}, node);
        } else {
            return node;
        }
    }

    return new TMPElement("noparse", {}, node);
}

/**
 * Create an alignment element.
 */
export function align(align: Align, ...content: TMPNode[]) {
    return new TMPElement("align", { align }, content);
}

/**
 * Create an alpha modulator element.
 */
export function alpha(alpha: string | number, ...content: TMPNode[]) {
    return new TMPElement("alpha", { alpha }, content);
}

/**
 * Create a colour element.
 */
export function color(
    clr: string | [number, number, number, number],
    ...content: TMPNode[]
): TMPElement {
    if (typeof clr === "string") {
        return new TMPElement("color", { color: clr }, content);
    }

    const [r, g, b, a] = clr;
    return color(hex(r) + hex(g) + hex(b) + hex(a), ...content);
}

/**
 * Create a bold element.
 */
export function bold(...content: TMPNode[]) {
    return new TMPElement("b", {}, content);
}

export { bold as b };

/**
 * Create an italics element.
 */
export function italics(...content: TMPNode[]) {
    return new TMPElement("i", {}, content);
}

export { italics as i };

/**
 * Create a spacing element.
 */
export function spacing(spacing: string | number, ...content: TMPNode[]) {
    return new TMPElement("cspace", { cspace: spacing }, content);
}

export { spacing as cspace };

/**
 * Create a font element.
 */
export function font(face: string, ...content: TMPNode[]) {
    return new TMPElement("font", { font: face }, content);
}

/**
 * Create an indentation element.
 */
export function indent(indent: string | number, ...content: TMPNode[]) {
    return new TMPElement("indent", { indent }, content);
}

/**
 * Create a line height element.
 */
export function lnheight(height: string | number, ...content: TMPNode[]) {
    return new TMPElement("line-height", { lineheight: height }, content);
}

/**
 * Create a line indent element.
 */
export function lnindent(indent: string | number, ...content: TMPNode[]) {
    return new TMPElement("line-indent", { "line-indent": indent }, content);
}

/**
 * Create a link element.
 */
export function link(resource: string, ...content: TMPNode[]) {
    return new TMPElement("link", { link: resource }, content);
}

/**
 * Create a lowercase element.
 */
export function lowercase(...content: TMPNode[]) {
    return new TMPElement("lowercase", {}, content);
}

/**
 * Create an uppercase element.
 */
export function uppercase(...content: TMPNode[]) {
    return new TMPElement("uppercase", {}, content);
}

/**
 * Create a smallcaps element.
 */
export function smallcaps(...content: TMPNode[]) {
    return new TMPElement("smallcaps", {}, content);
}

/**
 * Create a margin element.
 */
export function margin(margin: string | number, ...content: TMPNode[]) {
    return new TMPElement("margin", { margin }, content);
}

/**
 * Create a highlight element.
 */
export function highlight(
    color: string | [number, number, number, number],
    ...content: TMPNode[]
): TMPElement {
    if (typeof color === "string") {
        return new TMPElement("mark", { mark: color }, content);
    }

    const [r, g, b, a] = color;
    return highlight(hex(r) + hex(g) + hex(b) + hex(a), ...content);
}

export { highlight as mark };

/**
 * Create a monospace element.
 */
export function monospace(spacing: string | number, ...content: TMPNode[]) {
    return new TMPElement("mspace", { mspace: spacing }, content);
}

export { monospace as mono };

/**
 * Create a non-breaking space element.
 */
export function nbspace(...content: TMPNode[]) {
    return new TMPElement("nobr", {}, content);
}

/**
 * Create a page break element.
 */
export function nextpage() {
    return new TMPElement("page", {});
}

/**
 * Create a position element.
 */
export function pos(x: string | number, ...content: TMPNode[]) {
    return new TMPElement("pos", { pos: x }, content);
}

/**
 * Create a font size element.
 */
export function size(size: string | number, ...content: TMPNode[]) {
    return new TMPElement("size", { size }, content);
}

/**
 * Create a space element.
 */
export function space(space: string | number) {
    return new TMPElement("space", { space });
}

/**
 * Create a strikethrough element.
 */
export function strikethrough(...content: TMPNode[]) {
    return new TMPElement("s", {}, content);
}

export { strikethrough as strike, strikethrough as st, strikethrough as s };

/**
 * Create an underline element.
 */
export function underline(...content: TMPNode[]) {
    return new TMPElement("u", {}, content);
}

export { underline as u };

/**
 * Create a subscript element.
 */
export function subscript(...content: TMPNode[]) {
    return new TMPElement("sub", {}, content);
}

export { subscript as sub };

/**
 * Create a superscript element.
 */
export function superscript(...content: TMPNode[]) {
    return new TMPElement("sup", {}, content);
}

export { superscript as sup };

/**
 * Create a vertical offset element.
 */
export function voffset(offset: string | number, ...content: TMPNode[]) {
    return new TMPElement("voffset", { voffset: offset }, content);
}

/**
 * Create a width element.
 */
export function width(width: string | number, ...content: TMPNode[]) {
    return new TMPElement("width", { width }, content);
}
