import vueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "@vuetify/vite-plugin";
import { fileURLToPath, URL } from "url";

// https://github.com/governance-foundation/template-electron-vuex-vuetify/blob/master/vite.config.ts
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: "vitest-plugin-beforeall",
      config: () => ({
        test: { setupFiles: ["./vitest/beforeall.ts"] },
      }),
    },
    vue({
      // Allows for deconstructing props etc
      reactivityTransform: true,
    }),
    vueJsx(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
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
