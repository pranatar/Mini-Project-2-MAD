import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get reviews for a book
export const getBookReviews = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .order("desc")
      .collect();

    const result = [];
    for (const review of reviews) {
      const user = await ctx.db.get(review.userId);
      if (user) {
        result.push({ ...review, user });
      }
    }

    return result;
  },
});

// Add a review
export const addReview = mutation({
  args: {
    userId: v.id("users"),
    bookId: v.id("books"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already reviewed
    const existing = await ctx.db
      .query("reviews")
      .filter((q) =>
        q.and(q.eq(q.field("userId"), args.userId), q.eq(q.field("bookId"), args.bookId))
      )
      .first();

    if (existing) throw new Error("You already reviewed this book");

    const reviewId = await ctx.db.insert("reviews", {
      userId: args.userId,
      bookId: args.bookId,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    });

    // Update book rating
    const book = await ctx.db.get(args.bookId);
    if (book) {
      const newTotalRatings = book.totalRatings + 1;
      const newAverageRating =
        (book.rating * book.totalRatings + args.rating) / newTotalRatings;

      await ctx.db.patch(args.bookId, {
        rating: newAverageRating,
        totalRatings: newTotalRatings,
      });
    }

    return reviewId;
  },
});
