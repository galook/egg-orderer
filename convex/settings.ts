import { mutationGeneric, queryGeneric } from "convex/server";

const SETTINGS_KEY = "global";

export const get = queryGeneric({
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

export const close = mutationGeneric({
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

export const reopen = mutationGeneric({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", SETTINGS_KEY))
      .first();

    const orders = await ctx.db.query("orders").collect();
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }

    if (!settings) {
      return ctx.db.insert("settings", {
        key: SETTINGS_KEY,
        ordersClosed: false,
        closedAt: undefined,
        cookingStartedAt: undefined
      });
    }

    await ctx.db.patch(settings._id, {
      ordersClosed: false,
      closedAt: undefined,
      cookingStartedAt: undefined
    });
    return settings._id;
  }
});
