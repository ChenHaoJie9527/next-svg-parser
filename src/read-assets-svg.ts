import { readFileSync } from "node:fs"

export function readAssetsSvgFile(path: string) {
    const svgFile = readFileSync(path, "utf-8")
    return svgFile.replace(/\s+/g, " ") // 去掉多余空格
}