import { SVGNode } from "./types"
import { DOMParser as XMLDOMParser } from "xmldom"

// 定义解析结果的类型
type ParseResult = SVGNode | null;

export function parserSVG(svgContent: string): ParseResult {

    try {
        const fullSvgContent = ensureFullSVG(svgContent)
        const xmlDomParser = new XMLDOMParser()
        const doc = xmlDomParser.parseFromString(fullSvgContent, "image/svg+xml")
        const json = domToJson(doc.documentElement)
        return json
    } catch (error) {
        console.error((error as Error).message)
        return null
    }


}

function ensureFullSVG(svgContent: string): string {
    // 移除注释
    svgContent = svgContent.replace(/<!--(?:(?!<!--|]]>)[\s\S])*-->/g, '');
    let trimmed = svgContent.trim()
    const svgRegex = /^\s*<svg(?:\s+[^>]*)?>[\s\S]*<\/svg>\s*$/i;
    // 检查是否已经是完整的 SVG
    if (svgRegex.test(trimmed)) {
        return trimmed
    }
    // 检查是否以有效的 SVG 元素开始
    const validSvgElements = ['circle', 'rect', 'path', 'line', 'polyline', 'polygon', 'text', 'g', 'use', 'style'];
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
    const jsonNode: SVGNode = {
        tagName: (node as Element).tagName || 'text',
        type: node.nodeType === 1 ? 'element' : 'text',
        attributes: {},
        children: []
    }

    // 处理element节点
    if (node.nodeType === 1) {
        const element = node as Element
        Array.from(element.attributes).forEach(attr => {
            jsonNode.attributes![attr.name] = attr.value
        })
    }

    // 处理text节点
    if (node.nodeType === 3) {
        jsonNode.content = node.textContent || ''
        return jsonNode
    }

    // 处理 CDATA 节点
    if (node.nodeType === 4) {
        jsonNode.type = 'cdata'
        jsonNode.cdataContent = node.nodeValue || ''
        jsonNode.content = node.nodeValue || ''

    }

    //递归处理子节点
    if (node.childNodes) {
        Array.from(node.childNodes).forEach(child => {
            if (child.nodeType !== 8) {
                const childJsonNode = domToJson(child)
                if (childJsonNode?.type === 'element' || ((childJsonNode?.type === 'text' || childJsonNode?.type === 'cdata') && childJsonNode.content?.trim())) {
                    jsonNode.children?.push(childJsonNode)
                }
            }

        })
    }


    return jsonNode
}