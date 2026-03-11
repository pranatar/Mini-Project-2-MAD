import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all books with optional filters
export const getBooks = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let books = await ctx.db.query("books").order("desc").collect();

    // Filter by category
    if (args.category && args.category !== "All") {
      books = books.filter((book) => book.category === args.category);
    }

    // Search by title or author
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      books = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower)
      );
    }

    // Apply limit
    if (args.limit) {
      books = books.slice(0, args.limit);
    }

    return books;
  },
});

// Get featured books (high rating)
export const getFeaturedBooks = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const books = await ctx.db.query("books").order("desc").collect();
    const featured = books
      .filter((book) => book.rating >= 4.0)
      .sort((a, b) => b.rating - a.rating);

    if (args.limit) {
      return featured.slice(0, args.limit);
    }
    return featured;
  },
});

// Get book by ID
export const getBookById = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookId);
  },
});

// Get real-time book availability
export const getBookAvailability = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    if (!book) return null;

    const activeReservations = await ctx.db
      .query("borrowings")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .filter((q) => q.eq(q.field("status"), "reserved"))
      .collect();

    const activeBorrowings = await ctx.db
      .query("borrowings")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .filter((q) => q.eq(q.field("status"), "borrowed"))
      .collect();

    return {
      availableCopies: book.availableCopies,
      totalCopies: book.totalCopies,
      isAvailable: book.availableCopies > 0,
      activeReservations: activeReservations.length,
      activeBorrowings: activeBorrowings.length,
      isReserved: book.isReserved,
      reservedUntil: book.reservedUntil,
    };
  },
});

// Get all categories
export const getCategories = query({
  handler: async (ctx) => {
    const books = await ctx.db.query("books").collect();
    const categories = new Set(books.map((book) => book.category));
    return Array.from(categories);
  },
});

// Create a new book (admin function)
export const createBook = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    description: v.string(),
    coverImage: v.string(),
    category: v.string(),
    faculty: v.string(),
    shelfLocation: v.string(),
    floor: v.string(),
    section: v.string(),
    isbn: v.string(),
    publisher: v.string(),
    publishedYear: v.number(),
    pages: v.number(),
    language: v.string(),
    rating: v.number(),
    totalCopies: v.number(),
    isEbook: v.boolean(),
  },
  handler: async (ctx, args) => {
    const bookId = await ctx.db.insert("books", {
      ...args,
      totalRatings: 0,
      availableCopies: args.totalCopies,
      isReserved: false,
      createdAt: Date.now(),
    });
    return bookId;
  },
});

// Update book rating
export const updateBookRating = mutation({
  args: { bookId: v.id("books"), rating: v.number() },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    if (!book) throw new Error("Book not found");

    const newTotalRatings = book.totalRatings + 1;
    const newAverageRating =
      (book.rating * book.totalRatings + args.rating) / newTotalRatings;

    await ctx.db.patch(args.bookId, {
      rating: newAverageRating,
      totalRatings: newTotalRatings,
    });
  },
});

// Update book availability
export const updateBookAvailability = mutation({
  args: { bookId: v.id("books"), availableCopies: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookId, {
      availableCopies: args.availableCopies,
    });
  },
});
