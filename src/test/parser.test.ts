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
        const result = parserSVG(svg)
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {
                width: '100',
                height: '100'
            },
            children: []
        })
    })

    it('should parse nested elements', async () => {
        const svg = '<svg><circle cx="50" cy="50" r="40"/></svg>';
        const result = parserSVG(svg)
        expect(result?.tagName).toBe('svg')
        expect(result?.type).toBe('element')
        expect(result?.attributes).toEqual({})
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0]).toEqual({
            type: 'element',
            tagName: 'circle',
            attributes: {
                cx: '50',
                cy: '50',
                r: '40'
            },
            children: []
        })
    })

    it('should parse text content', async () => {
        const svg = '<svg><text x="50" y="50">Hello, World!</text></svg>';
        const result = parserSVG(svg)
        expect(result?.children?.[0]?.children).toHaveLength(1)
        expect(result?.children?.[0]?.children?.[0]?.type).toBe('text')
        expect(result?.children?.[0]?.children?.[0]?.tagName).toBe('text')
        expect(result?.children?.[0]?.children?.[0]?.attributes).toEqual({})
        expect(result?.children?.[0]?.children?.[0]?.children).toEqual([])
        expect(result?.children?.[0]?.children?.[0]?.children).toEqual([])
        expect(result?.children?.[0]?.children?.[0]?.content).toBe('Hello, World!')

    })

    it('should handle self-closing tags', async () => {
        const svg = '<svg><line x1="0" y1="0" x2="100" y2="100" /></svg>';
        const result = parserSVG(svg)
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0]).toEqual({
            type: 'element',
            tagName: 'line',
            attributes: {
                x1: '0',
                y1: '0',
                x2: '100',
                y2: '100'
            },
            children: []
        })
    })

    it('should handle empty attributes', async () => {
        const svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>';
        const result = parserSVG(svg)
        expect(result?.attributes).toEqual({
            viewBox: '0 0 100 100',
            xmlns: 'http://www.w3.org/2000/svg',
            version: '1.1'
        })
    })

    it('should handle whitespace correctly', async () => {
        const svg = `
            <svg>
              <rect x="10" y="10" width="30" height="30"/>
              <circle cx="50" cy="50" r="20"/>
            </svg>
        `;
        const result = parserSVG(svg)
        expect(result).toEqual({
            tagName: 'svg',
            type: 'element',
            attributes: {},
            children: [
                {
                    tagName: 'rect',
                    type: 'element',
                    attributes: {
                        x: '10',
                        y: '10',
                        width: '30',
                        height: '30'
                    },
                    children: []
                },
                {
                    tagName: 'circle',
                    type: 'element',
                    attributes: {
                        cx: '50',
                        cy: '50',
                        r: '20'
                    },
                    children: []
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
        const result = parserSVG(svg)
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {},
            children: [{
                type: 'element',
                tagName: 'circle',
                attributes: {
                    r: '50'
                },
                children: []
            }
            ]
        })
    })

    it('should handle SVG with CDATA sections', async () => {
        const svg = '<svg><style><![CDATA[circle { fill: red; }]]></style><circle r="50"/></svg>';
        const result = parserSVG(svg)
        expect(result?.children).toHaveLength(2)

        expect(result?.children?.[0]).toEqual({
            type: 'element',
            tagName: 'style',
            attributes: {},
            children: [
                {
                    tagName: 'text',
                    type: 'cdata',
                    attributes: {},
                    children: [],
                    cdataContent: 'circle { fill: red; }',
                    content: 'circle { fill: red; }'
                }
            ]
        })

        expect(result?.children?.[1]).toEqual({
            type: 'element',
            tagName: 'circle',
            attributes: {
                r: '50'
            },
            children: []
        })
    })

    it('should handle SVG with namespaces', async () => {
        const svg = '<svg xmlns:xlink="http://www.w3.org/1999/xlink"><image xlink:href="image.jpg"/></svg>';
        const result = parserSVG(svg)
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {
                'xmlns:xlink': 'http://www.w3.org/1999/xlink'
            },
            children: [{
                type: 'element',
                tagName: 'image',
                attributes: {
                    'xlink:href': 'image.jpg'
                },
                children: []
            }]
        })
    })

    it('should handle malformed SVG without throwing error', async () => {
        const svg = '<svg><unclosed>';
        const result = parserSVG(svg)
        expect(result).toBeNull() // should handle malformed SVG without throwing error return null
    })

    it('should handle SVG with numeric attribute values', async () => {
        const svg = '<svg><rect x="10" y="10" width="100" height="100" opacity="0.5"/></svg>';
        const result = parserSVG(svg)
        expect(result?.children?.[0]).toEqual({
            type: 'element',
            tagName: 'rect',
            attributes: {
                x: '10',
                y: '10',
                width: '100',
                height: '100',
                opacity: '0.5'
            },
            children: []
        })
    })

    it('should handle SVG with embedded HTML', async () => {
        const svg = '<svg><foreignObject><div xmlns="http://www.w3.org/1999/xhtml">Hello</div></foreignObject></svg>';
        const result = parserSVG(svg)
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0].tagName).toBe('foreignObject')
        expect(result?.children?.[0].type).toBe('element')
        expect(result?.children?.[0]?.children).toHaveLength(1)
        expect(result?.children?.[0]?.children?.[0]).toEqual({
            type: 'element',
            tagName: 'div',
            attributes: {
                xmlns: 'http://www.w3.org/1999/xhtml'
            },
            children: [{
                type: 'text',
                content: 'Hello',
                tagName: 'text',
                attributes: {},
                children: []
            }],
        })

    })
    it('should handle SVG with not svg tag to return null', async () => {
        const svg = '<notsvg><circle r="50"/></notsvg>';
        const result = parserSVG(svg)
        expect(result).toBeNull()
    })

    it('should handle empty svg input to return null', async () => {
        const result = parserSVG('  ')
        expect(result).toBeNull()
    })

    it('should handle SVG fragments', async () => {
        const fragment = '<circle cx="50" cy="50" r="40"/>';
        const result = parserSVG(fragment);
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {
                xmlns: 'http://www.w3.org/2000/svg'
            },
            children: [
                {
                    type: 'element',
                    tagName: 'circle',
                    attributes: {
                        cx: '50',
                        cy: '50',
                        r: '40'
                    },
                    children: []
                }
            ]
        })
    })

    it('should handle deeply nested elements', async () => {
        const svg = '<svg><g><g><g><circle r="10"/></g></g></g></svg>';
        const result = parserSVG(svg);
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {
            },
            children: [
                {
                    type: 'element',
                    tagName: 'g',
                    attributes: {},
                    children: [
                        {
                            type: 'element',
                            tagName: 'g',
                            attributes: {},
                            children: [
                                {
                                    type: 'element',
                                    tagName: 'g',
                                    attributes: {},
                                    children: [
                                        {
                                            type: 'element',
                                            tagName: 'circle',
                                            attributes: {
                                                r: '10'
                                            },
                                            children: []
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        })
    });

    it('should handle special characters in attributes and text', async () => {
        const svg = '<svg><text x="10" y="20" data-special="&lt;&gt;&amp;\'&quot;">Special &lt; &gt; &amp; \' " chars</text></svg>';
        const result = parserSVG(svg);
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0]).toEqual({
            type: 'element',
            tagName: 'text',
            attributes: {
                x: '10',
                y: '20',
                'data-special': '<>&\'"'
            },
            children: [{
                type: 'text',
                content: `Special < > & ' " chars`,
                tagName: 'text',
                attributes: {},
                children: []
            }],
        })
    });

    it('should handle SVG with animation elements', async () => {
        const svg = '<svg><circle r="10"><animate attributeName="r" from="10" to="20" dur="1s" repeatCount="indefinite"/></circle></svg>';
        const result = parserSVG(svg);
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0].children?.[0]).toEqual({
            type: 'element',
            tagName: 'animate',
            attributes: {
                attributeName: 'r',
                from: '10',
                to: '20',
                dur: '1s',
                repeatCount: 'indefinite'
            },
            children: []
        })
    });

    it('should handle SVG with XML declaration', async () => {
        const svg = '<?xml version="1.0" encoding="UTF-8"?><svg></svg>';
        const result = parserSVG(svg);
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {
                xmlns: 'http://www.w3.org/2000/svg'
            },
            children: []
        })
    });

    it('should handle SVG with XML declaration and existing namespace', async () => {
        const svg = '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg"></svg>';
        const result = parserSVG(svg);
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {
                xmlns: 'http://www.w3.org/2000/svg'
            },
            children: []
        })
    });

    it('should handle SVG without XML declaration but with namespace', async () => {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
        const result = parserSVG(svg);
        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {
                xmlns: 'http://www.w3.org/2000/svg'
            },
            children: []
        })
    });
    it('should parse SVG imported as a string in SPA', async () => {
        const imported = await import("../assets/test.svg")
        const result = parserSVG(imported.default)
        expect(result?.tagName).toBe('svg')
        expect(result?.type).toBe('element')
        expect(result?.attributes).toEqual({
            xmlns: 'http://www.w3.org/2000/svg',
            width: '200',
            height: '200',
            viewBox: '0 0 200 200'
        })
        const lent = result?.children
        expect(lent).toHaveLength(5)
        expect(lent?.[0]).toEqual({
            tagName: 'circle',
            type: 'element',
            attributes: { cx: '100', cy: '100', r: '90', fill: '#f0f0f0' },
            children: []
        })
        expect(lent?.[1]).toEqual({
            tagName: 'text',
            type: 'element',
            attributes: {
                x: '40',
                y: '110',
                'font-family': 'monospace',
                'font-size': '40',
                fill: '#4a4a4a'
            },
            children: [
                {
                    tagName: 'text',
                    type: 'text',
                    attributes: {},
                    children: [],
                    content: '<svg>'
                }
            ]
        })
    })
})