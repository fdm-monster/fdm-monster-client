import VueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import Vuetify from "@vuetify/vite-plugin";
import { fileURLToPath, URL } from "url";
import AutoImport from "unplugin-auto-import/vite";

// https://github.com/governance-foundation/template-electron-vuex-vuetify/blob/master/vite.config.ts
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // @ts-ignore
    {
      name: "vitest-plugin-beforeall",
      config: () => ({
        test: { setupFiles: ["./vitest/beforeall.ts"] },
      }),
    },
    AutoImport({
      imports: [
        "vue",
        "@vueuse/core",
        "pinia",
        "vue-router",
        "vee-validate",
        {
          "@/stores/index": [
            "usePrintersStore",
            "usePrinterFilesStore",
            "usePrinterGroupsStore",
            "useUploadsStore",
          ],
        },
      ],
      resolvers: [],
      /* options */
    }),
    Vue({
      // Allows for deconstructing props etc
      reactivityTransform: true,
    }),
    VueJsx(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    Vuetify({
      autoImport: true,
    }),
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // '@': path.resolve(__dirname, 'src'),
    },
    extensions: [
      ".js",
      ".json",
      ".jsx",
      ".mjs",
      ".ts",
      ".tsx",
      ".vue",
      ".css",
      ".scss",
    ],
  },
  // @ts-ignore
  test: {
    globals: true,
    globalSetup: ["./vitest/setup.ts"],
    environment: "jsdom",
    deps: {
      inline: ["vuetify"],
    },
  },
  /* remove the need to specify .vue files https://vitejs.dev/config/#resolve-extensions
    resolve: {
      extensions: [
        '.js',
        '.json',
        '.jsx',
        '.mjs',
        '.ts',
        '.tsx',
        '.vue',
      ]
    },
    */
});
