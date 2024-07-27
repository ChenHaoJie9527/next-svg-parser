import path from "path"
import { defineConfig } from "vitest/config"
import { terser } from "rollup-plugin-terser"

export default defineConfig({
    build: {
        lib: {
            entry: {
                index: path.resolve(__dirname, "src/index.ts"),
                cli: path.resolve(__dirname, "src/cli.js")
            },
            name: "next-svg-parser",
            fileName: (format, entryName) => entryName === 'cli' ? 'cli.cjs' : `${entryName}.${format}.js`,
            formats: ['es', 'cjs']
        },
        rollupOptions: {
            external: ['vitest', 'fs', 'path', "xmldom", 'fs/promise', "memfs", 'assets/**/*', "commander"],
            plugins: [
                terser(),
            ],
            output: {
                globals: {
                    commander: 'commander',
                    xmldom: 'xmldom',
                    memfs: 'memfs'
                }
            }
        },
        target: 'node16',
        sourcemap: false,
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