import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Create user (mutation)
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      avatar: args.avatar,
      createdAt: Date.now(),
    });
    return userId;
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: { name?: string; avatar?: string } = {};
    if (args.name) updateData.name = args.name;
    if (args.avatar) updateData.avatar = args.avatar;

    await ctx.db.patch(args.userId, updateData);
  },
});
