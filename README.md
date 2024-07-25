<p align="center">   <img src="public/logo.svg" alt="next-svg-parser logo" width="200" height="200"> </p>

# next-svg-parser

[![npm version](https://badge.fury.io/js/next-svg-parser.svg)](https://badge.fury.io/js/next-svg-parser)
[![Test Coverage](https://img.shields.io/badge/coverage-90%2B%25-brightgreen.svg)](https://github.com/yourusername/next-svg-parser/actions)

A robust and efficient SVG to JSON parser built with TypeScript, leveraging the power of DOMParser for accurate SVG parsing.

## Features

- Parses SVG strings into a structured JSON format
- Handles complex, nested SVG structures
- Supports all SVG elements and attributes
- Processes SVG with comments, CDATA sections, and namespaces
- High test coverage (90%+) ensuring reliability
- Lightweight and easy to integrate

## Installation

```bash
npm install next-svg-parser
```

or

```bash
pnpm install next-svg-parser
```

or

```bash
yarn add next-svg-parser
```

## Current Version

The current stable version of next-svg-parser is 1.0.0. This version includes [brief description of key features or changes].

## address

For more information, see the [npm package page](https://www.npmjs.com/package/next-svg-parser).

## Usage

```ts
import { parseSVG } from 'next-svg-parser';

const svgString = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrows-up-down-square">
    <path d="m6 9 3-3 3 3"/>
    <path d="M9 6v6"/>
    <rect width="20" height="20" x="2" y="2" rx="2"/>
    <path d="M15 18v-6"/>
    <path d="m18 15-3 3-3-3"/>
  </svg>
`;

const result = parseSVG(svgString);
console.log(result);
```

## Output

```json
{
  "type": "element",
  "tagName": "svg",
  "attributes": {
    "xmlns": "http://www.w3.org/2000/svg",
    "width": "24",
    "height": "24",
    "viewBox": "0 0 24 24",
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "class": "lucide lucide-arrows-up-down-square"
  },
  "children": [
    {
      "type": "element",
      "tagName": "path",
      "attributes": {
        "d": "m6 9 3-3 3 3"
      }
    },
    {
      "type": "element",
      "tagName": "path",
      "attributes": {
        "d": "M9 6v6"
      }
    },
    {
      "type": "element",
      "tagName": "rect",
      "attributes": {
        "width": "20",
        "height": "20",
        "x": "2",
        "y": "2",
        "rx": "2"
      }
    },
    {
      "type": "element",
      "tagName": "path",
      "attributes": {
        "d": "M15 18v-6"
      }
    },
    {
      "type": "element",
      "tagName": "path",
      "attributes": {
        "d": "m18 15-3 3-3-3"
      }
    }
  ]
}
```

## API

### `parseSVG(svgString: string): SVGNode`

Parses an SVG string and returns a JSON representation of the SVG structure.

- `svgString`: A string containing valid SVG markup.
- Returns: An `SVGNode` object representing the parsed SVG structure.

## Types

```ts
interface SVGNode {
  type: 'element' | 'text';
  tagName?: string;
  attributes?: { [key: string]: string };
  children?: SVGNode[];
  content?: string;
}
```

## Testing

This library has a test coverage of over 90%. We use Vitest for running tests and generating coverage reports.

To run the tests:

```bash
npm test
```

To view the test coverage report:

```bash
npm run coverage
```

您说得对，我应该将之前讨论的所有内容整合到一个完整的 README.md 文档中。以下是一个更全面的版本，包含了我们之前讨论的所有重要细节：

```
markdownCopy# next-svg-parser

[![npm version](https://badge.fury.io/js/next-svg-parser.svg)](https://badge.fury.io/js/next-svg-parser)
[![Test Coverage](https://img.shields.io/badge/coverage-90%2B%25-brightgreen.svg)](https://github.com/yourusername/next-svg-parser/actions)

A robust and efficient SVG to JSON parser built with TypeScript, leveraging the power of DOMParser for accurate SVG parsing.

## Features

- Parses SVG strings into a structured JSON format
- Handles complex, nested SVG structures
- Supports all SVG elements and attributes
- Processes SVG with comments, CDATA sections, and namespaces
- High test coverage (90%+) ensuring reliability
- Lightweight and easy to integrate

## Installation

```bash
npm install next-svg-parser
```

## Usage

```
typescriptCopyimport { parseSVG } from 'next-svg-parser';

const svgString = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrows-up-down-square">
    <path d="m6 9 3-3 3 3"/>
    <path d="M9 6v6"/>
    <rect width="20" height="20" x="2" y="2" rx="2"/>
    <path d="M15 18v-6"/>
    <path d="m18 15-3 3-3-3"/>
  </svg>
`;

const result = parseSVG(svgString);
console.log(JSON.stringify(result, null, 2));
```

Output:

```
jsonCopy{
  "type": "element",
  "tagName": "svg",
  "attributes": {
    "xmlns": "http://www.w3.org/2000/svg",
    "width": "24",
    "height": "24",
    "viewBox": "0 0 24 24",
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "class": "lucide lucide-arrows-up-down-square"
  },
  "children": [
    {
      "type": "element",
      "tagName": "path",
      "attributes": {
        "d": "m6 9 3-3 3 3"
      }
    },
    {
      "type": "element",
      "tagName": "path",
      "attributes": {
        "d": "M9 6v6"
      }
    },
    {
      "type": "element",
      "tagName": "rect",
      "attributes": {
        "width": "20",
        "height": "20",
        "x": "2",
        "y": "2",
        "rx": "2"
      }
    },
    {
      "type": "element",
      "tagName": "path",
      "attributes": {
        "d": "M15 18v-6"
      }
    },
    {
      "type": "element",
      "tagName": "path",
      "attributes": {
        "d": "m18 15-3 3-3-3"
      }
    }
  ]
}
```

## API

### `parseSVG(svgString: string): SVGNode`

Parses an SVG string and returns a JSON representation of the SVG structure.

- `svgString`: A string containing valid SVG markup.
- Returns: An `SVGNode` object representing the parsed SVG structure.

## Types

```
typescriptCopyinterface SVGNode {
  type: 'element' | 'text';
  tagName?: string;
  attributes?: { [key: string]: string };
  children?: SVGNode[];
  content?: string;
}
```

## Testing

This library has a test coverage of over 90%. We use Vitest for running tests and generating coverage reports.

To run the tests:

```
bash

Copy

npm test
```

To view the test coverage report:

```
bash

Copy

npm run coverage
```

Our test suite covers various scenarios including:

- Simple and complex SVG structures
- Nested elements
- Text content
- Self-closing tags
- Multiple attributes
- Whitespace handling
- SVG with comments and CDATA sections
- Namespace handling
- Edge cases and error handling

## Contributing

We welcome contributions! If you'd like to contribute, please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure that your code adheres to the existing style and that all tests pass. If you're adding new functionality, please include appropriate tests.

## Feedback and Issues

If you encounter any issues or have suggestions for improvements, please open an issue on our GitHub repository. We appreciate your feedback and contributions to making this library better.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

------

Made with ❤️ by [Your Name/Organization]

We're constantly working to improve next-svg-parser. If you have any suggestions or find any bugs, please don't hesitate to contribute or reach out!