import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's favorites
export const getUserFavorites = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const result = [];
    for (const fav of favorites) {
      const book = await ctx.db.get(fav.bookId);
      if (book) {
        result.push({ ...fav, book });
      }
    }

    return result;
  },
});

// Add to favorites
export const addToFavorites = mutation({
  args: { userId: v.id("users"), bookId: v.id("books") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_book", (q) =>
        q.eq("userId", args.userId).eq("bookId", args.bookId)
      )
      .first();

    if (existing) throw new Error("Already in favorites");

    await ctx.db.insert("favorites", {
      userId: args.userId,
      bookId: args.bookId,
      createdAt: Date.now(),
    });
  },
});

// Remove from favorites
export const removeFromFavorites = mutation({
  args: { userId: v.id("users"), bookId: v.id("books") },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_book", (q) =>
        q.eq("userId", args.userId).eq("bookId", args.bookId)
      )
      .first();

    if (!favorite) throw new Error("Not in favorites");

    await ctx.db.delete(favorite._id);
  },
});

// Check if book is favorite
export const isFavorite = query({
  args: { userId: v.id("users"), bookId: v.id("books") },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_book", (q) =>
        q.eq("userId", args.userId).eq("bookId", args.bookId)
      )
      .first();

    return !!favorite;
  },
});
