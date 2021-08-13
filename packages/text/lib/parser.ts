import { DocElement, TMPElement, TMPTag } from "./builder";

export enum TokenType {
    BeginTag,
    EndTag,
    Close,
    Word,
    Equals,
}

export enum PartType {
    None,
    Tag,
    Text
}

export interface ParseToken {
    type: TokenType;
    value: string;
}

export interface BaseParsePart {
    type: PartType|null;
    value: any|null;
}

export interface TagParsePart extends BaseParsePart {
    type: PartType.Tag;
    value: {
        tagName: TMPTag;
        attributes: TagPartAttribute[];
        children: ParsePart[];
    }|null;
}

export interface TextParsePart extends BaseParsePart {
    type: PartType.Text;
    value: string|null;
}

export type ParsePart = BaseParsePart | TagParsePart | TextParsePart;

export interface TagPartAttribute {
    key: string;
    value: string|null;
}

function transformer(tokens: ParseToken[]): ParsePart[];
function transformer(
    tokens: ParseToken[],
    tagName: string
): [number, ParsePart[]];
function transformer(tokens: ParseToken[], tagName?: string) {
    const parts: ParsePart[] = [];
    let i = 0;
    for (i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        const next = tokens[i + 1];
        const part: ParsePart = {
            type: null,
            value: null,
        };

        if (token.type === TokenType.EndTag) continue;

        if (token.type === TokenType.Word) {
            part.type = PartType.Text;
            part.value = token.value;
        } else if (token.type === TokenType.BeginTag) {
            if (
                next &&
                next.type === TokenType.Close &&
                tokens[i + 2] &&
                tokens[i + 2].value === tagName
            ) {
                return [++i, parts];
            }

            const attributes: TagPartAttribute[] = [];

            while (tokens[i].type !== TokenType.EndTag) {
                i++;
                const token = tokens[i];
                const last = tokens[i - 1];

                if (i >= tokens.length) {
                    return [];
                }

                if (tokens[i].type === TokenType.Word) {
                    if (last.type === TokenType.Equals) {
                        attributes[attributes.length - 1].value = token.value;
                    } else {
                        attributes.push({
                            key: token.value,
                            value: null,
                        });
                    }
                }
            }
            part.type = PartType.Tag;
            part.value = {
                tagName: attributes[0].key,
                attributes: attributes,
                children: [],
            };
            const [j, child_parts] = transformer(
                tokens.slice(i),
                part.value.tagName
            ) as [number, ParsePart[]];
            i += j + 2;
            part.value.children = child_parts || [];
        }

        parts.push(part);
    }

    if (tagName) {
        return [i, parts];
    }

    return parts;
}

function construct(part: ParsePart | ParsePart[]) {
    if (Array.isArray(part)) {
        const doc = new DocElement;
        for (let i = 0; i < part.length; i++) {
            doc.children.push(construct(part[i]));
        }
        return doc;
    }

    if (part.type === PartType.Tag) {
        const tagPart = part as TagParsePart;
        const attributes: Record<string, string> = {};
        if (!tagPart.value)
            return;
        for (let i = 0; i < tagPart.value.attributes.length; i++) {
            const attr = tagPart.value.attributes[i];
            if (attr.value) attributes[attr.key] = attr.value;
        }

        const elem = new TMPElement(part.value.tagName, attributes);
        for (let i = 0; i < part.value.children.length; i++) {
            const child = part.value.children[i];
            elem.children.push(construct(child));
        }
        return elem;
    } else if (part.type === PartType.Text) {
        return part.value;
    }
}

export function parseTMP(content: string) {
    let tokens: (ParseToken|null)[] = [];
    let in_tag = false;
    let in_quote = false;
    let escaping = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const last = tokens[tokens.length - 1];

        if (in_quote) {
            if (char === '"') {
                if (!escaping) {
                    in_quote = false;
                    continue;
                }
                escaping = false;
            } else if (char === "\\") {
                escaping = !escaping;
            } else {
                escaping = false;
                if (last) last.value += content[i];
            }
        } else {
            if (/\s/.test(char) && in_tag) {
                tokens.push(null);
            } else if (char === "<") {
                in_tag = true;
                tokens.push({ type: TokenType.BeginTag, value: "<" });
            } else if (char === ">") {
                in_tag = false;
                tokens.push({ type: TokenType.EndTag, value: ">" });
            } else if (char === "/") {
                tokens.push({ type: TokenType.Close, value: "/" });
            } else if (char === "=") {
                tokens.push({ type: TokenType.Equals, value: "=" });
            } else if (char === '"') {
                tokens.push({ type: TokenType.Word, value: "" });
                in_quote = true;
            } else if (/ |\w|\d|[#-]/.test(char)) {
                if (last && last.type === TokenType.Word) {
                    if (char === " ") {
                        if (last.value[last.value.length - 1] !== " ") {
                            last.value += content[i];
                        }
                    } else {
                        last.value += content[i];
                    }
                } else {
                    tokens.push({ type: TokenType.Word, value: content[i] });
                }
            }
        }
    }

    tokens = tokens.filter((token) => token); // Remove whitespace

    return construct(transformer(tokens as ParseToken[]));
}