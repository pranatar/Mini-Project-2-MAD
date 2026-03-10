import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or create user with Google OAuth
export const getOrCreateGoogleUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    googleId: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to find existing user by googleId
    const existingByGoogleId = await ctx.db
      .query("users")
      .withIndex("by_google_id", (q) => q.eq("googleId", args.googleId))
      .first();

    if (existingByGoogleId) {
      return existingByGoogleId;
    }

    // Try to find existing user by email
    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingByEmail) {
      // Update existing user with googleId
      await ctx.db.patch(existingByEmail._id, {
        googleId: args.googleId,
        avatar: args.avatar || existingByEmail.avatar,
      });
      return await ctx.db.get(existingByEmail._id);
    }

    // Create new user (default role: mahasiswa)
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      avatar: args.avatar,
      googleId: args.googleId,
      role: "mahasiswa", // Default role
      createdAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

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

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: { name?: string; avatar?: string } = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.avatar !== undefined) updateData.avatar = args.avatar;

    await ctx.db.patch(args.userId, updateData);
    return await ctx.db.get(args.userId);
  },
});

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("mahasiswa"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
    return await ctx.db.get(args.userId);
  },
});

// Get all users (admin only)
export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").collect();
  },
});

// Get current session user (for auth state)
export const getCurrentUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});
