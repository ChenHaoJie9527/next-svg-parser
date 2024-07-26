import { expect, describe, it, vi, beforeEach, afterEach } from "vitest"
import { parserSVG } from "../parser"

const svgImport = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <!-- 背景圆形 -->
  <circle cx="100" cy="100" r="90" fill="#f0f0f0"/>
  
  <!-- SVG 符号 (左侧) -->
  <text x="40" y="110" font-family="monospace" font-size="40" fill="#4a4a4a">&lt;svg&gt;</text>
  
  <!-- 箭头 (中间) -->
  <path d="M80 100 L120 100 M110 90 L120 100 L110 110" stroke="#2196f3" stroke-width="4" fill="none"/>
  
  <!-- JSON 符号 (右侧) -->
  <text x="130" y="110" font-family="monospace" font-size="40" fill="#4a4a4a">{}</text>
  
  <!-- 解析线条动画 -->
  <path d="M30 130 Q100 170 170 130" stroke="#2196f3" stroke-width="2" fill="none" stroke-dasharray="5,5">
    <animate attributeName="stroke-dashoffset" from="10" to="0" dur="2s" repeatCount="indefinite"/>
  </path>
</svg>
`

vi.mock("../assets/test.svg", () => {
    return {
        default: svgImport
    }
})

describe('parser', () => {
    it('should parse a simple SVG element', async () => {
        const svg = '<svg width="100" height="100"></svg>';
        const result = await parserSVG(svg)
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {
                width: '100',
                height: '100'
            }
        })
    })

    it('should parse nested elements', async () => {
        const svg = '<svg><circle cx="50" cy="50" r="40"/></svg>';
        const result = await parserSVG(svg)
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {},
            children: [
                {
                    type: 'element',
                    tagName: 'circle',
                    attributes: {
                        cx: '50',
                        cy: '50',
                        r: '40'
                    },
                }
            ]
        })
    })

    it('should parse text content', async () => {
        const svg = '<svg><text x="50" y="50">Hello, World!</text></svg>';
        const result = await parserSVG(svg)
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {},
            children: [
                {
                    type: 'element',
                    tagName: 'text',
                    attributes: {
                        x: '50',
                        y: '50'
                    },
                    children: [{
                        type: 'text',
                        content: 'Hello, World!',
                    }]
                }
            ]
        })
    })

    it('should handle self-closing tags', async () => {
        const svg = '<svg><line x1="0" y1="0" x2="100" y2="100" /></svg>';
        const result = await parserSVG(svg)
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0]).toEqual({
            type: 'element',
            tagName: 'line',
            attributes: {
                x1: '0',
                y1: '0',
                x2: '100',
                y2: '100',
            },
        })
    })

    it('should handle empty attributes', async () => {
        const svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>';
        const result = await parserSVG(svg)
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {
                viewBox: '0 0 100 100',
                xmlns: 'http://www.w3.org/2000/svg',
                version: '1.1'
            },
        })
    })

    it('should handle whitespace correctly', async () => {
        const svg = `
            <svg>
              <rect x="10" y="10" width="30" height="30"/>
              <circle cx="50" cy="50" r="20"/>
            </svg>
        `;
        const result = await parserSVG(svg)
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {},
            children: [
                {
                    type: 'element',
                    tagName: 'rect',
                    attributes: {
                        x: '10',
                        y: '10',
                        width: '30',
                        height: '30'
                    },
                },
                {
                    type: 'element',
                    tagName: 'circle',
                    attributes: {
                        cx: '50',
                        cy: '50',
                        r: '20'
                    },
                }
            ]
        })
    })

    it('should parse a complex SVG icon', async () => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrows-up-down-square">
            <path d="m6 9 3-3 3 3"/>
            <path d="M9 6v6"/>
            <rect width="20" height="20" x="2" y="2" rx="2"/>
            <path d="M15 18v-6"/>
            <path d="m18 15-3 3-3-3"/>
        </svg>`;
        const result = await parserSVG(svg)
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '24',
                height: '24',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                class: 'lucide lucide-arrows-up-down-square'
            },
            children: expect.arrayContaining([
                expect.objectContaining({ tagName: 'path' }),
                expect.objectContaining({ tagName: 'path' })
            ])
        })
        expect(result?.children).toHaveLength(5)
    })

    it('should handle SVG with comments', async () => {
        const svg = '<svg><!-- This is a comment --><circle r="50"/></svg>';
        const result = await parserSVG(svg)
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0].tagName).toBe('circle')
        expect(result?.children?.[0].attributes).toEqual({
            r: '50'
        })
    })

    it('should handle SVG with CDATA sections', async () => {
        const svg = '<svg><style><![CDATA[circle { fill: red; }]]></style><circle r="50"/></svg>';
        const result = await parserSVG(svg)
        expect(result?.children).toHaveLength(2)
        expect(result?.children?.[0].tagName).toBe('style')
        expect(result?.children?.[1].tagName).toBe('circle')
    })

    it('should handle SVG with namespaces', async () => {
        const svg = '<svg xmlns:xlink="http://www.w3.org/1999/xlink"><image xlink:href="image.jpg"/></svg>';
        const result = await parserSVG(svg)
        expect(result?.attributes?.['xmlns:xlink']).toBe('http://www.w3.org/1999/xlink')
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0]?.attributes?.['xlink:href']).toBe('image.jpg')
    })

    it('should handle malformed SVG without throwing error', async () => {
        const svg = '<svg><unclosed>';
        expect(() => parserSVG(svg)).rejects.toThrowError('Invalid SVG content: Does not contain valid SVG elements')
    })

    it('should handle SVG with numeric attribute values', async () => {
        const svg = '<svg><rect x="10" y="10" width="100" height="100" opacity="0.5"/></svg>';
        const result = await parserSVG(svg)
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0]?.attributes).toEqual({
            x: '10',
            y: '10',
            width: '100',
            height: '100',
            opacity: '0.5'
        })
    })

    it('should handle SVG with embedded HTML', async () => {
        const svg = '<svg><foreignObject><div xmlns="http://www.w3.org/1999/xhtml">Hello</div></foreignObject></svg>';
        const result = await parserSVG(svg)
        expect(result?.children?.[0]?.tagName).toBe('foreignobject')
        expect(result?.children?.[0]?.children?.[0]?.tagName).toBe('div')
        expect(result?.children?.[0]?.children?.[0]?.children?.[0]).toEqual({
            type: 'text',
            content: 'Hello'
        })
    })
    it('should handle SVG with not svg tag', async () => {
        const svg = '<notsvg><circle r="50"/></notsvg>';
        expect(() => parserSVG(svg)).rejects.toThrowError('Invalid SVG content: Does not contain valid SVG elements')
    })

    it('should handle empty svg input', async () => {
        expect(() => parserSVG('')).rejects.toThrowError('Invalid SVG content: Does not contain valid SVG elements')
        expect(() => parserSVG('   ')).rejects.toThrowError('Invalid SVG content: Does not contain valid SVG elements');
    })

    it('should handle SVG fragments', async () => {
        const fragment = '<circle cx="50" cy="50" r="40"/>';
        const result = await parserSVG(fragment);
        expect(result?.tagName).toBe('svg');
        expect(result?.children?.[0]?.tagName).toBe('circle');
    })

    it('should handle deeply nested elements', async () => {
        const svg = '<svg><g><g><g><circle r="10"/></g></g></g></svg>';
        const result = await parserSVG(svg);
        expect(result?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.tagName).toBe('circle');
        expect(result?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.attributes).toEqual({
            r: '10'
        })
    });

    it('should handle special characters in attributes and text', async () => {
        const svg = '<svg><text x="10" y="20" data-special="&lt;&gt;&amp;\'&quot;">Special &lt; &gt; &amp; \' " chars</text></svg>';
        const result = await parserSVG(svg);
        expect(result?.children?.[0]?.attributes?.['data-special']).toBe('<>&\'"');
        expect(result?.children?.[0]?.children?.[0]?.content).toBe('Special < > & \' " chars');
    });

    it('should handle SVG with animation elements', async () => {
        const svg = '<svg><circle r="10"><animate attributeName="r" from="10" to="20" dur="1s" repeatCount="indefinite"/></circle></svg>';
        const result = await parserSVG(svg);
        expect(result?.children?.[0]?.children?.[0]?.tagName).toBe('animate');
        expect(result?.children?.[0]?.children?.[0]?.attributes).toEqual({
            attributeName: 'r',
            from: '10',
            to: '20',
            dur: '1s',
            repeatCount: 'indefinite'
        })
    });

    it('should handle SVG with XML declaration', async () => {
        const svg = '<?xml version="1.0" encoding="UTF-8"?><svg></svg>';
        const result = await parserSVG(svg);
        expect(result?.type).toBe('element')
        expect(result?.tagName).toBe('svg')
        expect(result?.attributes).toEqual({
            xmlns: 'http://www.w3.org/2000/svg'
        })
    });

    it('should handle SVG with XML declaration and existing namespace', async () => {
        const svg = '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg"></svg>';
        const result = await parserSVG(svg);
        expect(result?.tagName).toBe('svg');
        expect(result?.attributes?.xmlns).toBe('http://www.w3.org/2000/svg');
    });

    it('should handle SVG without XML declaration but with namespace', async () => {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
        const result = await parserSVG(svg);
        expect(result?.tagName).toBe('svg');
        expect(result?.attributes?.xmlns).toBe('http://www.w3.org/2000/svg');
    });
    it('should parse SVG imported as a string in SPA', async () => {
        const imported = await import("../assets/test.svg")
        const result = await parserSVG(imported.default)
        expect(result?.type).toBe('element')
        expect(result?.tagName).toBe('svg')
        expect(result?.attributes).toEqual({
            xmlns: 'http://www.w3.org/2000/svg',
            width: '200',
            height: '200',
            viewBox: '0 0 200 200',
        })
        expect(result?.children).toHaveLength(5)
    })
})