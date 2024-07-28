#!/usr/bin/env node

import fs from "fs";
import { parserSVG } from "./index";
import path from "path";

const input = process.argv[2];
const output = process.argv[3];

if (!input || !output) {
  console.error(
    "Usage: next-svg-parser <input-svg-file-or-directory> <output-json-file-or-directory>"
  );
  process.exit(1);
}

function processFile(inputFile, output) {
  try {
    const svgContent = fs.readFileSync(inputFile, "utf8");
    const parsedSVG = parserSVG(svgContent);

    let outputFile, outputDir;

    // 获取输入文件的基本名称（不包含扩展名）
    const inputBaseName = path.basename(inputFile, ".svg");
    // 检查输出是文件还是目录
    if (path.extname(output) === "") {
      // 如果没有扩展名，视为目录
      outputDir = output;
      outputFile = path.join(output, `${inputBaseName}.json`);
    } else {
      // 如果有扩展名，视为文件
      outputFile = output;
      outputDir = path.dirname(output);
    }
    // 确保输出目录存在
    fs.mkdirSync(outputDir, { recursive: true });

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

  fs.readdirSync(inputDir).forEach((file) => {
    if (path.extname(file).toLowerCase() === ".svg") {
      const inputFile = path.join(inputDir, file);
      const jsonFileName = path.basename(file, ".svg") + ".json";
      const outputFile = path.join(outputDir, jsonFileName);
      processFile(inputFile, outputFile);
    }
  });
}

if (fs.statSync(input).isDirectory()) {
  processDirectory(input, output);
} else {
  // 处理单个文件
  let outputFile = output;
  if (fs.existsSync(output) && fs.statSync(output).isDirectory()) {
    // 如果输出是目录,在其中创建与输入同名的json文件
    const jsonFileName = path.basename(input, ".svg") + ".json";
    outputFile = path.join(output, jsonFileName);
  } else if (!output.endsWith(".json")) {
    // '/' 表示目录
    if (!output.endsWith("/")) {
      outputFile += ".json";
    }
  }
  processFile(input, outputFile);
}
