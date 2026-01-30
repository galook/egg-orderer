import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
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
        { name: "description", content: "Live breakfast egg ordering with Convex and Nuxt." }
      ]
    }
  },
  runtimeConfig: {
    public: {
      convexUrl: process.env.NUXT_PUBLIC_CONVEX_URL || ""
    }
  }
});
