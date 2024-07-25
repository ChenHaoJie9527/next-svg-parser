import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "index",
            fileName(format, entryName) {
                return `index.${format}.js`
            },
        },
        rollupOptions: {
            external: [/^vitest/, /^node:/, 'fs', 'path', 'fs/promise'],
        },
        sourcemap: true,
        // 明确指定构建输出目录
        outDir: 'dist',
        // 构建前清空输出目录
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        environment: 'jsdom',
        coverage: {
            enabled: true,
        }
    }
})