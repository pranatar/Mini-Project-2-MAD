import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's reading progress
export const getUserReadingProgress = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const progressList = await ctx.db
      .query("readingProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const result = [];
    for (const progress of progressList) {
      const book = await ctx.db.get(progress.bookId);
      if (book) {
        result.push({ ...progress, book });
      }
    }

    return result;
  },
});

// Get reading progress for a specific book
export const getBookProgress = query({
  args: { userId: v.id("users"), bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("readingProgress")
      .withIndex("by_user_book", (q) =>
        q.eq("userId", args.userId).eq("bookId", args.bookId)
      )
      .first();
  },
});

// Update reading progress
export const updateReadingProgress = mutation({
  args: {
    userId: v.id("users"),
    bookId: v.id("books"),
    currentPage: v.number(),
    totalPages: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("readingProgress")
      .withIndex("by_user_book", (q) =>
        q.eq("userId", args.userId).eq("bookId", args.bookId)
      )
      .first();

    const percentage = Math.round((args.currentPage / args.totalPages) * 100);

    if (existing) {
      await ctx.db.patch(existing._id, {
        currentPage: args.currentPage,
        totalPages: args.totalPages,
        percentage,
        lastReadAt: Date.now(),
      });
    } else {
      await ctx.db.insert("readingProgress", {
        userId: args.userId,
        bookId: args.bookId,
        currentPage: args.currentPage,
        totalPages: args.totalPages,
        percentage,
        lastReadAt: Date.now(),
      });
    }
  },
});

// Delete reading progress
export const deleteReadingProgress = mutation({
  args: { userId: v.id("users"), bookId: v.id("books") },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("readingProgress")
      .withIndex("by_user_book", (q) =>
        q.eq("userId", args.userId).eq("bookId", args.bookId)
      )
      .first();

    if (progress) {
      await ctx.db.delete(progress._id);
    }
  },
});
