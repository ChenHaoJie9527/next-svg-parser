import { SVGNode } from "./types"

export function parserSVG(svgContent: string): SVGNode | null {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, "image/svg+xml")
    const json = domToJson(doc.documentElement)

    return json
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