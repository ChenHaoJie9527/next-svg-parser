export interface SVGNode {
    type: 'element' | 'text' | string;
    tagName?: string;
    attributes?: { [key: string]: string };
    children?: SVGNode[];
    content?: string;
}