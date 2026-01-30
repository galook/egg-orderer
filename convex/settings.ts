import { mutation, query } from "convex/server";

const SETTINGS_KEY = "global";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", SETTINGS_KEY))
      .first();
    if (existing) return existing;
    const id = await ctx.db.insert("settings", {
      key: SETTINGS_KEY,
      ordersClosed: false,
      closedAt: undefined,
      cookingStartedAt: undefined
    });
    return ctx.db.get(id);
  }
});

export const close = mutation({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", SETTINGS_KEY))
      .first();
    if (!settings) {
      return ctx.db.insert("settings", {
        key: SETTINGS_KEY,
        ordersClosed: true,
        closedAt: Date.now(),
        cookingStartedAt: undefined
      });
    }
    await ctx.db.patch(settings._id, {
      ordersClosed: true,
      closedAt: Date.now()
    });
    return settings._id;
  }
});
