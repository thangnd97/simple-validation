import {defineConfig} from 'vite'
import dts from 'vite-plugin-dts'
import {extname, relative, resolve} from 'path'
import {fileURLToPath} from "node:url";
import {glob} from "glob";
// https://vite.dev/config/
export default defineConfig({
    plugins: [dts({include: ['lib']})],
    build: {
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, 'lib/main.ts'),
            formats: ['es']
        },
        rollupOptions: {
            external: ['react', 'react/jsx-runtime', '@remix-run/react', '@shopify/remix-oxygen'],
            input: Object.fromEntries(
                glob.sync('lib/**/*.{ts,tsx}', {
                    // ignore: ["lib/**/*.d.ts"],
                }).map(file => [
                    relative('lib', file.slice(0, file.length - extname(file).length)),
                    fileURLToPath(new URL(file, import.meta.url))
                ])
            ),
            output: {
                assetFileNames: 'assets/[name][extname]',
                entryFileNames: '[name].js'
            }
        }
    }
})
