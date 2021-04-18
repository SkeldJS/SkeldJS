import { TMPNode } from "./builder";

export function toHTML(elem: TMPNode | TMPNode[]) {
    if (typeof elem === "string") {
        return "<span>" + elem + "</span>";
    }

    let out = "";

    if (Array.isArray(elem)) {
        for (let i = 0; i < elem.length; i++) {
            out += toHTML(elem[i]);
        }
        return out;
    }

    if (elem.tagName === "doc") {
        out += '<div style="width:100%;height:100%;">';
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "align") {
        out += `<div style="text-align:${elem.attributes.align};">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "alpha") {
        out += `<div style="display:inline-block;opacity:${
            parseInt(elem.attributes.alpha as string, 16) / 255
        };">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "color") {
        out += `<div style="display:inline-block;color:${elem.attributes.color}">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "b") {
        out += "<b>" + toHTML(elem.children) + "</b>";
    } else if (elem.tagName === "i") {
        out += "<i>" + toHTML(elem.children) + "</i>";
    } else if (elem.tagName === "cspace") {
        out += `<div style="display:inline-block;letter-spacing:${elem.attributes.cspace}">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "font") {
        out += `<div style="display:inline-block;font-family:${elem.attributes.font}">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "indent") {
        out += `<div style="display:inline-block;padding-left:${elem.attributes.indent}">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "line-height") {
        out += `<div style="display:inline-block;line-height:${elem.attributes["line-height"]}">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "line-indent") {
        out += `<div style="display:inline-block;text-indent:${elem.attributes["line-indent"]}">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "link") {
        out += `<div style="display:inline-block;color:inherit;text-decoration:inherit;" href=${elem.attributes.link}>`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "lowercase") {
        out += `<div style="display:inline-block;text-transform:lowercase;">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "uppercase") {
        out += `<div style="display:inline-block;text-transform:uppercase;">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "smallcaps") {
        out += `<div style="display:inline-block;font-variant:small-caps;">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "margin") {
        out += `<div style="display:inline-block;margin-left:${elem.attributes.margin};margin-right:${elem.attributes.margin};">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "mark") {
        out += `<div style="display:inline-block;background-color:${elem.attributes.mark}">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "mspace") {
        out += `<div style="display:inline-block;text-transform:full-width;letter-spacing:${elem.attributes.mspace};">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "nobr") {
        out += toHTML(elem.children).replace(" ", "&nbsp;");
    } else if (elem.tagName === "page") {
        out += `<div style="display:inline-block;break-after:always">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "pos") {
        out += `<div style="display:inline-block;text-indent:${elem.attributes.margin}">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "size") {
        out += `<div style="font-size:${elem.attributes.size}">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "space") {
        out += `<div style="display:inline-block;margin-left:${elem.attributes.margin}">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "s") {
        out += `<div style="display:inline-block;text-decoration:line-through;">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "u") {
        out += `<div style="display:inline-block;text-decoration:underline;">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "sub") {
        out += `<div style="display:inline-block;vertical-align:sub;">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "sup") {
        out += `<div style="display:inline-block;vertical-align:super;">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "voffset") {
        out += `<div style="display:inline-block;transform:translate(0%,${elem.attributes.voffset})l">`;
        out += toHTML(elem.children);
        out += "</div>";
    } else if (elem.tagName === "width") {
        out += `<div style="display:inline-block;width:${elem.attributes.width}">`;
        out += toHTML(elem.children);
        out += "</div>";
    }

    return out;
}
