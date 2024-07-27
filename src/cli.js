#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { program } from "commander";
import { parserSVG } from "./index";

program
  .version("1.0.8")
  .description("A CLI for parsing SVG files to JSON")
  .option("-i, --input <directory>", "Input directory containing SVG files")
  .option("-o, --output <directory>", "Output directory for JSON files")
  .parse(process.argv);

const options = program.opts();

console.log("Input directory:", options.input);
console.log("Output directory:", options.output);

if (!options.input || !options.output) {
  console.error("Please provide both an input and output directory.");
  process.exit(1);
}

const inputDir = path.resolve(options.input);
const outputDir = path.resolve(options.output);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
fs.readdirSync(inputDir).forEach((file) => {
  if (path.extname(file).toLowerCase() === ".svg") {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(
      outputDir,
      `${path.basename(file, ".svg")}.json`
    );

    console.log("Processing file:", inputPath);

    const svgContent = fs.readFileSync(inputPath, "utf8");
    console.log("SVG content type:", typeof svgContent);
    console.log("SVG content length:", svgContent.length);
    
    try {
      const parsedSVG = parserSVG(svgContent);
      console.log("Parsed SVG type:", typeof parsedSVG);
      fs.writeFileSync(outputPath, JSON.stringify(parsedSVG, null, 2));
      console.log("Output written to:", outputPath);
    } catch (error) {
      console.error("Error parsing SVG:", error);
    }
  }
});
