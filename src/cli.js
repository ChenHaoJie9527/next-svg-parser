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

if (!options.input || !options.output) {
  console.error("Please provide both an input and output directory.");
  process.exit(1);
}

function processDirectory(inputDir, outputDir) {
  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir, "utf-8");
  files.forEach((file) => {
    if (path.extname(file).toLowerCase() === ".svg") {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(
        outputDir,
        `${path.basename(file, ".svg")}.json`
      );
      const svgContent = fs.readFileSync(inputPath, "utf-8");
      const parsedSvg = parserSVG(svgContent);

      fs.writeFileSync(outputPath, parsedSvg);
      console.log(`Processed: ${inputPath} -> ${outputPath}`);
    }
  });
}

processDirectory(options.input, options.output);
