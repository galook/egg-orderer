import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { eggSeconds } from "../utils/egg";

const getSettings = async (ctx: any) => {
  return ctx.db
    .query("settings")
    .withIndex("by_key", (q: any) => q.eq("key", "global"))
    .first();
};

export const create = mutationGeneric({
  args: {
    userId: v.id("users"),
    eggType: v.union(v.literal("soft"), v.literal("medium"), v.literal("hard")),
    quantity: v.number()
  },
  handler: async (ctx, args) => {
    const settings = await getSettings(ctx);
    if (settings?.ordersClosed) {
      throw new Error("Orders are closed.");
    }
    const id = await ctx.db.insert("orders", {
      userId: args.userId,
      eggType: args.eggType,
      quantity: args.quantity,
      status: "open",
      createdAt: Date.now()
    });
    await ctx.scheduler.runAfter(0, internal.emails.sendOrderPlaced, { orderId: id });
    return id;
  }
});

export const list = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").order("desc").collect();
    const result = [] as any[];
    for (const order of orders) {
      const user = await ctx.db.get(order.userId);
      result.push({ ...order, user });
    }
    return result;
  }
});

export const listByUser = queryGeneric({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId as any))
      .order("desc")
      .collect();
    return orders;
  }
});

export const startCooking = mutationGeneric({
  args: {},
  handler: async (ctx) => {
    const settings = await getSettings(ctx);
    if (!settings?.ordersClosed) {
      throw new Error("Close orders before cooking.");
    }
    if (settings.cookingStartedAt) return settings._id;

    const startedAt = Date.now();
    const orders = await ctx.db.query("orders").collect();
    for (const order of orders) {
      const duration =
        eggSeconds[order.eggType as keyof typeof eggSeconds] ?? eggSeconds.medium;
      const readyAt = startedAt + duration * 1000;
      await ctx.db.patch(order._id, {
        status: "cooking",
        readyAt
      });
      await ctx.scheduler.runAt(readyAt, internal.emails.sendOrderReady, {
        orderId: order._id
      });
    }

    await ctx.db.patch(settings._id, { cookingStartedAt: startedAt });
    return settings._id;
  }
});

export const schedule = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const result = [] as any[];
    for (const order of orders) {
      const user = await ctx.db.get(order.userId);
      result.push({
        orderId: order._id,
        eggType: order.eggType,
        quantity: order.quantity,
        readyAt: order.readyAt,
        userName: user?.name ?? "Unknown"
      });
    }
    return result
      .filter((item) => item.readyAt)
      .sort((a, b) => (a.readyAt ?? 0) - (b.readyAt ?? 0));
  }
});
