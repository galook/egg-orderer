import { ConvexClient } from "convex/browser";

let client: ConvexClient | null = null;

export const useConvexClient = () => {
  const config = useRuntimeConfig();
  if (!client) {
    if (!config.public.convexUrl) {
      console.warn("NUXT_PUBLIC_CONVEX_URL is not set.");
    }
    client = new ConvexClient(config.public.convexUrl);
  }
  return client;
};
