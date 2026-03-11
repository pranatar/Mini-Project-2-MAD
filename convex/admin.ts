import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get summary stats for the Admin Dashboard (Updated to force sync)
export const getStats = query({
  handler: async (ctx) => {
    const totalBooks = await ctx.db.query("books").collect();
    const totalUsers = await ctx.db.query("users").collect();
    const borrowings = await ctx.db.query("borrowings").collect();

    const activeBorrowings = borrowings.filter(b => b.status === "borrowed");
    const overdueBorrowings = borrowings.filter(b => b.status === "overdue");
    const reservedBorrowings = borrowings.filter(b => b.status === "reserved");

    // Recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentBorrowings = borrowings.filter(b => b.borrowDate > sevenDaysAgo);
    const recentReturns = borrowings.filter(b => b.returnDate && b.returnDate > sevenDaysAgo);

    return {
      totalBooks: totalBooks.length,
      totalUsers: totalUsers.length,
      activeBorrowings: activeBorrowings.length,
      overdueBorrowings: overdueBorrowings.length,
      reservedBorrowings: reservedBorrowings.length,
      recentBorrowings: recentBorrowings.length,
      recentReturns: recentReturns.length,
    };
  },
});

// Get recent activity for dashboard
export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const borrowings = await ctx.db.query("borrowings").order("desc").take(limit);

    const activities = await Promise.all(
      borrowings.map(async (b) => {
        const user = await ctx.db.get(b.userId);
        const book = await ctx.db.get(b.bookId);
        
        let activityType: "borrow" | "return" | "reserve" | "overdue" = "borrow";
        if (b.status === "returned" && b.returnDate) activityType = "return";
        else if (b.status === "reserved") activityType = "reserve";
        else if (b.status === "overdue") activityType = "overdue";

        return {
          id: b._id,
          type: activityType,
          userName: user?.name || "Unknown User",
          userAvatar: user?.avatar,
          bookTitle: book?.title || "Unknown Book",
          bookCover: book?.coverImage,
          timestamp: b.borrowDate,
          returnDate: b.returnDate,
          dueDate: b.dueDate,
          status: b.status,
        };
      })
    );

    return activities;
  },
});

// Get all borrowings for management
export const getAllBorrowings = query({
  handler: async (ctx) => {
    const borrowings = await ctx.db.query("borrowings").order("desc").collect();
    
    return Promise.all(
      borrowings.map(async (b) => {
        const user = await ctx.db.get(b.userId);
        const book = await ctx.db.get(b.bookId);
        return {
          ...b,
          userName: user?.name || "Unknown User",
          bookTitle: book?.title || "Unknown Book",
        };
      })
    );
  },
});

// Add a new book
export const addBook = mutation({
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
    availableCopies: v.number(),
    totalCopies: v.number(),
    isEbook: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("books", {
      ...args,
      rating: 0,
      totalRatings: 0,
      isReserved: false,
      createdAt: Date.now(),
    });
  },
});

// Update an existing book
export const updateBook = mutation({
  args: {
    bookId: v.id("books"),
    title: v.optional(v.string()),
    author: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    category: v.optional(v.string()),
    availableCopies: v.optional(v.number()),
    totalCopies: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { bookId, ...updateFields } = args;
    await ctx.db.patch(bookId, updateFields);
    return bookId;
  },
});

// Delete a book
export const deleteBook = mutation({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    // Check if book is currently borrowed
    const activeBorrows = await ctx.db
      .query("borrowings")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .filter((q) => q.eq(q.field("status"), "borrowed"))
      .collect();

    if (activeBorrows.length > 0) {
      throw new Error("Cannot delete book while it is borrowed.");
    }

    await ctx.db.delete(args.bookId);
  },
});

// Confirm borrowing return (Admin action)
export const confirmReturn = mutation({
  args: { borrowingId: v.id("borrowings") },
  handler: async (ctx, args) => {
    const borrowing = await ctx.db.get(args.borrowingId);
    if (!borrowing) throw new Error("Borrowing not found");
    if (borrowing.status === "returned") return;

    // Update borrowing status
    await ctx.db.patch(args.borrowingId, {
      status: "returned",
      returnDate: Date.now(),
    });

    // Increase book stock
    const book = await ctx.db.get(borrowing.bookId);
    if (book) {
      await ctx.db.patch(borrowing.bookId, {
        availableCopies: book.availableCopies + 1,
      });
    }

    // Send notification
    await ctx.db.insert("notifications", {
      userId: borrowing.userId,
      title: "Return Confirmed",
      message: `Admin has confirmed the return of "${book?.title}". Thank you!`,
      type: "return",
      isRead: false,
      createdAt: Date.now(),
    });
  },
});
