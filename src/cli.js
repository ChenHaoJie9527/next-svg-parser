#!/usr/bin/env node

// const fs = require('fs');
import fs from "fs";
// const { parserSVG } = require('./index'); // 你的主要解析函数
import { parserSVG } from "./index";
console.log('11111111111111111');
const inputFile = process.argv[2];
const outputFile = process.argv[3];
console.log('inputFile =>', inputFile);
console.log('outputFile =>', outputFile);

if (!inputFile || !outputFile) {
  console.error("Usage: next-svg-parser <input-svg-file> <output-json-file>");
  process.exit(1);
}

try {
  const svgContent = fs.readFileSync(inputFile, "utf8");
  console.log('svgContent =>', svgContent);
  const parsedSVG = parserSVG(svgContent);
  console.log('parsedSVG >', parsedSVG);
  fs.writeFileSync(outputFile, parsedSVG);
  console.log(`Successfully parsed ${inputFile} to ${outputFile}`);
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
