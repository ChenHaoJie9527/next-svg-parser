import { SVGNode } from "./types"
export async function parserSVG(svgContent: string): Promise<SVGNode | null> {

    const fullSvgContent = ensureFullSVG(svgContent)
    let doc: Document;

    const parser = new DOMParser()
    doc = parser.parseFromString(fullSvgContent, "image/svg+xml")

    const errorNode = doc.querySelector('parsererror')
    if (errorNode) {
        throw new Error(`Invalid SVG: ${errorNode?.textContent}`);
    }
    const json = domToJson(doc.documentElement)

    return json
}

function ensureFullSVG(svgContent: string): string {
    const trimmed = svgContent.trim()
    const svgRegex = /^\s*<svg(?:\s+[^>]*)?>[\s\S]*<\/svg>\s*$/i;
    // 检查是否已经是完整的 SVG
    if (svgRegex.test(trimmed)) {
        return trimmed
    }
    // 检查是否以有效的 SVG 元素开始
    const validSvgElements = ['circle', 'rect', 'path', 'line', 'polyline', 'polygon', 'text', 'g', 'use'];
    const validStartRegex = new RegExp(`^\\s*<(${validSvgElements.join('|')})(?:\\s+[^>]*)?>`);
    // 如果是一个有效的svg元素，则应该被包含在svg标签中
    if (validStartRegex.test(trimmed)) {
        return `<svg xmlns="http://www.w3.org/2000/svg">${trimmed}</svg>`;
    }

    // 检查是否包含 XML 声明
    const xmlRegex = /^\s*<\?xml[^>]+\?>/i;
    const hasXMLDeclaration = xmlRegex.test(trimmed)
    if (hasXMLDeclaration) {
        const withoutXmlDeclaration = trimmed.replace(/^\s*<\?xml[^>]*\?>\s*/i, '')
        return ensureSvgNamespace(withoutXmlDeclaration)
    }

    // 如果既不是完整的 SVG，也不包含任何 SVG 元素，则抛出错误
    throw new Error('Invalid SVG content: Does not contain valid SVG elements');
}

function ensureSvgNamespace(svgString: string) {
    if (!(/\sxmlns\s*=/.test(svgString))) {
        return svgString.replace('svg', 'svg xmlns="http://www.w3.org/2000/svg"')
    }
    return svgString
}

function domToJson(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
        const content = node.textContent?.trim()
        return content ? { type: 'text', content } : null
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        const result: SVGNode = {
            type: 'element',
            tagName: element.tagName.toLowerCase(),
            attributes: {},
            children: [],
        }

        // 解析属性
        for (const attr of Array.from(element.attributes)) {
            result.attributes![attr.name] = attr.value
        }

        //解析子节点
        element.childNodes.forEach(child => {
            const childRes = domToJson(child)
            if (childRes) {
                result.children?.push(childRes)
            }
        })

        // 如果没有子节点，删除 children 属性
        if (result?.children?.length === 0) {
            delete result.children;
        }

        return result

    }

    return null
}