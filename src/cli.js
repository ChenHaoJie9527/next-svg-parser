#!/usr/bin/env node

import fs from "fs";
import { parserSVG } from "./index";

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.error(
    "Usage: next-svg-parser <input-svg-file-or-directory> <output-json-file-or-directory>"
  );
  process.exit(1);
}

function processFile(inputFile, outputDir) {
  try {
    const svgContent = fs.readFileSync(inputFile, "utf8");
    const parsedSVG = parserSVG(svgContent);

    // 保持文件名一致,只改变扩展名
    const fileName = path.basename(inputFile);
    const jsonFileName = fileName.replace(/\.svg$/i, ".json");
    const outputFile = path.join(outputDir, jsonFileName);

    fs.writeFileSync(outputFile, JSON.stringify(parsedSVG, null, 2));
    console.log(`Successfully parsed ${inputFile} to ${outputFile}`);
  } catch (error) {
    console.error(`Error processing ${inputFile}:`, error.message);
  }
}

function processDirectory(inputDir, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.readdirSync(inputDir).forEach(file => {
    if (path.extname(file).toLowerCase() === '.svg') {
      const inputFile = path.join(inputDir, file);
      processFile(inputFile, outputDir);
    }
  });
}

if (fs.statSync(input).isDirectory()) {
  processDirectory(input, output);
} else {
  const outputDir = path.dirname(output);
  processFile(input, outputDir);
}
