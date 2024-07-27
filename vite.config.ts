import path from "path"
import { defineConfig } from "vitest/config"
import { terser } from "rollup-plugin-terser"

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "next-svg-parser",
            fileName(format, entryName) {
                return `index.${format}.js`
            },
            formats: ["es", "umd"]
        },
        rollupOptions: {
            external: ['vitest', /^node:/, 'fs', 'path', 'fs/promise', 'assets/**/*'],
            plugins: [
                terser(),
            ],
        },
        sourcemap: true,
        // 明确指定构建输出目录
        outDir: 'dist',
        // 构建前清空输出目录
        emptyOutDir: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log'],
                ecma: 2016
            },
        }
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
        },
    }
})