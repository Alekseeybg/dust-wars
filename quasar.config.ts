import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from '#q-app';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  css: ['app.scss'],
  extras: ['roboto-font', 'material-icons'],
  build: {
    alias: {
      src: resolve(projectRoot, 'src'),
      app: projectRoot,
      components: resolve(projectRoot, 'src/components'),
      layouts: resolve(projectRoot, 'src/layouts'),
      pages: resolve(projectRoot, 'src/pages'),
      stores: resolve(projectRoot, 'src/stores'),
      types: resolve(projectRoot, 'src/types'),
      data: resolve(projectRoot, 'src/data'),
      utils: resolve(projectRoot, 'src/utils'),
      domain: resolve(projectRoot, 'src/domain'),
    },
    typescript: { strict: true, vueShim: true },
    // The nested route table in src/router/routes.ts owns routing.
    vueRouterMode: 'history',
    vitePlugins: [
      [
        'vite-plugin-checker',
        {
          vueTsc: true,
          eslint: {
            lintCommand: 'eslint -c ./eslint.config.js src',
            useFlatConfig: true,
          },
        },
        { server: false },
      ],
    ],
  },
  devServer: { open: true },
  framework: {
    plugins: ['Notify', 'Dialog'],
    config: {
      dark: true,
      notify: { position: 'top', timeout: 2400 },
    },
  },
}));
