export interface SVGNode {
    type: 'element' | 'text' | 'cdata';
    tagName?: string;
    attributes?: { [key: string]: string };
    children?: SVGNode[];
    content?: string;
    cdataContent?: string;
}