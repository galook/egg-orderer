import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    role: v.union(v.literal("eater"), v.literal("cooker")),
    createdAt: v.number()
  }),
  orders: defineTable({
    userId: v.id("users"),
    eggType: v.union(v.literal("soft"), v.literal("medium"), v.literal("hard")),
    quantity: v.number(),
    status: v.union(v.literal("open"), v.literal("cooking"), v.literal("done")),
    createdAt: v.number(),
    readyAt: v.optional(v.number())
  }).index("by_user", ["userId"]),
  settings: defineTable({
    key: v.string(),
    ordersClosed: v.boolean(),
    closedAt: v.optional(v.number()),
    cookingStartedAt: v.optional(v.number())
  }).index("by_key", ["key"])
});
