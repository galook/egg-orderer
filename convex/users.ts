import { mutation, query } from "convex/server";
import { v } from "convex/values";

export const create = mutation({
  args: { name: v.string(), role: v.union(v.literal("eater"), v.literal("cooker")) },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("users", {
      name: args.name,
      role: args.role,
      createdAt: Date.now()
    });
    return id;
  }
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id as any);
  }
});
