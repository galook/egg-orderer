import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

export const create = mutationGeneric({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    role: v.union(v.literal("eater"), v.literal("cooker"))
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("users", {
      name: args.name,
      email: args.email?.trim() || undefined,
      role: args.role,
      createdAt: Date.now()
    });
    return id;
  }
});

export const getById = queryGeneric({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id as any);
  }
});
