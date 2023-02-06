import path from "path";
import react from "@vitejs/plugin-react";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { webpackStats } from "rollup-plugin-webpack-stats";
import { defineConfig } from "vite";
import copy from "./vite/copy";

export default defineConfig({
  root: "./",
  publicDir: "./server/static",
  server: {
    port: 3001,
  },
  plugins: [
    // https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#readme
    react({
      babel: {
        babelrc: true,
        presets: [
          "@babel/preset-react",
          "@babel/preset-typescript",
          [
            "@babel/preset-env",
            {
              corejs: {
                version: "3",
                proposals: true,
              },
              useBuiltIns: "usage",
              exclude: [
                "transform-modules-commonjs",
                "proposal-dynamic-import",
              ],
            },
          ],
        ],
      },
    }),
    copy(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  build: {
    outDir: "./build/app",
    manifest: true,
    target: browserslistToEsbuild(),
    reportCompressedSize: false,
    rollupOptions: {
      /**
       * Regular assets can be hosted on a CDN.
       * But the Service Worker code must not be hosted on a CDN.
       * That’s why we need to separate the code:
       */
      input: {
        index: "./app/index.tsx",
        sw: "./app/sw/sw.ts",
        registerSW: "./app/sw/registerSW.ts",
      },
      output: [
        {
          entryFileNames: (chunkInfo) => {
            const isServiceWorker = ["sw", "registerSW"].includes(
              chunkInfo.name
            );

            if (chunkInfo.isEntry && isServiceWorker) {
              return `sw/[name].js`;
            }

            return `[name].js`;
          },
        },
      ],
      plugins: [webpackStats()],
    },
  },
});
