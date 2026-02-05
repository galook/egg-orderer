import { fileURLToPath } from "node:url";
import { defineNuxtConfig } from "nuxt/config";
import "dotenv/config";

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: ["@vite-pwa/nuxt"],
  vite: {
    resolve: {
      alias: {
        "#app-manifest": fileURLToPath(new URL("./app-manifest.stub.ts", import.meta.url))
      }
    }
  },
  app: {
    head: {
      title: "Egg Orderer",
      meta: [
        { name: "description", content: "Live breakfast egg ordering with Convex and Nuxt." },
        { name: "theme-color", content: "#f5a24a" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" }
      ],
      link: [{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" }]
    }
  },
  pwa: {
    registerType: "autoUpdate",
    includeAssets: ["apple-touch-icon.png"],
    manifest: {
      name: "Egg Orderer",
      short_name: "Egg Orderer",
      description: "Live breakfast egg ordering with Convex and Nuxt.",
      theme_color: "#f5a24a",
      background_color: "#fbf4ea",
      display: "standalone",
      start_url: "/",
      scope: "/",
      icons: [
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png"
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    },
    workbox: {
      navigateFallback: "/"
    },
    devOptions: {
      enabled: true
    }
  },
  runtimeConfig: {
    public: {
      convexUrl: process.env.NUXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL || "none"
    }
  }
});
