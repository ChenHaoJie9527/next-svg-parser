import { expect, describe, it } from "vitest"
import { parserSVG } from "../parser"

describe('parser', () => {
    it('should parse a simple SVG element', () => {
        const svg = '<svg width="100" height="100"></svg>';
        const result = parserSVG(svg)

        expect(result).toEqual({
            type: 'element',
            tagName: 'svg',
            attributes: {
                width: '100',
                height: '100'
            }
        })
    })

    it('should parse nested elements', () => {
        const svg = '<svg><circle cx="50" cy="50" r="40"/></svg>';
        const result = parserSVG(svg)
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

    it('should parse text content', () => {
        const svg = '<svg><text x="50" y="50">Hello, World!</text></svg>';
        const result = parserSVG(svg)
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

    it('should handle self-closing tags', () => {
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
                y2: '100',
            },
        })
    })

    it('should handle empty attributes', () => {
        const svg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>';
        const result = parserSVG(svg)
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

    it('should handle whitespace correctly', () => {
        const svg = `
            <svg>
              <rect x="10" y="10" width="30" height="30"/>
              <circle cx="50" cy="50" r="20"/>
            </svg>
        `;
        const result = parserSVG(svg)
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

    it('should parse a complex SVG icon', () => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrows-up-down-square">
            <path d="m6 9 3-3 3 3"/>
            <path d="M9 6v6"/>
            <rect width="20" height="20" x="2" y="2" rx="2"/>
            <path d="M15 18v-6"/>
            <path d="m18 15-3 3-3-3"/>
        </svg>`;
        const result = parserSVG(svg)
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

    it('should handle SVG with comments', () => {
        const svg = '<svg><!-- This is a comment --><circle r="50"/></svg>';
        const result = parserSVG(svg)
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0].tagName).toBe('circle')
        expect(result?.children?.[0].attributes).toEqual({
            r: '50'
        })
    })

    it('should handle SVG with CDATA sections', () => {
        const svg = '<svg><style><![CDATA[circle { fill: red; }]]></style><circle r="50"/></svg>';
        const result = parserSVG(svg)
        expect(result?.children).toHaveLength(2)
        expect(result?.children?.[0].tagName).toBe('style')
        expect(result?.children?.[1].tagName).toBe('circle')
    })

    it('should handle SVG with namespaces', () => {
        const svg = '<svg xmlns:xlink="http://www.w3.org/1999/xlink"><image xlink:href="image.jpg"/></svg>';
        const result = parserSVG(svg)
        expect(result?.attributes?.['xmlns:xlink']).toBe('http://www.w3.org/1999/xlink')
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0]?.attributes?.['xlink:href']).toBe('image.jpg')
    })

    it('should handle malformed SVG without throwing error', () => {
        const svg = '<svg><unclosed>';
        const result = parserSVG(svg)
        expect(result?.tagName).toBe('parsererror')
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0]).toEqual({
            type: 'text',
            content: '1:15: unclosed tag: unclosed'
        })
        expect(() => parserSVG(svg)).not.toThrow()
    })

    it('should handle SVG with numeric attribute values', () => {
        const svg = '<svg><rect x="10" y="10" width="100" height="100" opacity="0.5"/></svg>';
        const result = parserSVG(svg)
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0]?.attributes).toEqual({
            x: '10',
            y: '10',
            width: '100',
            height: '100',
            opacity: '0.5'
        })
    })

    it('should handle SVG with embedded HTML', () => {
        const svg = '<svg><foreignObject><div xmlns="http://www.w3.org/1999/xhtml">Hello</div></foreignObject></svg>';
        const result = parserSVG(svg)
        expect(result?.children?.[0]?.tagName).toBe('foreignobject')
        expect(result?.children?.[0]?.children?.[0]?.tagName).toBe('div')
        expect(result?.children?.[0]?.children?.[0]?.children?.[0]).toEqual({
            type: 'text',
            content: 'Hello'
        })
    })
    it('should handle SVG with not svg tag', () => {
        const svg = '<notsvg><circle r="50"/></notsvg>';
        const result = parserSVG(svg)
        expect(result?.tagName).toBe('notsvg')
        expect(result?.children).toHaveLength(1)
        expect(result?.children?.[0]).toEqual({
            type: 'element',
            tagName: 'circle',
            attributes: {
                r: '50'
            }
        })
        expect(() => parserSVG(svg)).not.toThrow()
    })
})