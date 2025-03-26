import {defineConfig} from 'vite'
import dts from 'vite-plugin-dts'
import {resolve} from 'path'
// https://vite.dev/config/
export default defineConfig({
    plugins: [dts({include: ['lib']})],
    build: {
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, 'lib/main.ts'),
            formats: ['es']
        },
    }
})
