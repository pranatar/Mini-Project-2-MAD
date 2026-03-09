import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const BORROWING_PERIOD_DAYS = 14;
const MAX_EXTENSIONS = 2;

// Get user's borrowings
export const getUserBorrowings = query({
  args: { userId: v.id("users"), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let borrowings = await ctx.db
      .query("borrowings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (args.status) {
      borrowings = borrowings.filter((b) => b.status === args.status);
    }

    // Get book details for each borrowing
    const result = [];
    for (const borrowing of borrowings) {
      const book = await ctx.db.get(borrowing.bookId);
      if (book) {
        result.push({ ...borrowing, book });
      }
    }

    return result.reverse();
  },
});

// Borrow a book
export const borrowBook = mutation({
  args: { userId: v.id("users"), bookId: v.id("books") },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    if (!book) throw new Error("Book not found");
    if (book.availableCopies <= 0) throw new Error("Book not available");

    // Check if user already borrowed this book
    const existing = await ctx.db
      .query("borrowings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.and(
        q.eq(q.field("bookId"), args.bookId),
        q.eq(q.field("status"), "borrowed")
      ))
      .first();

    if (existing) throw new Error("You already borrowed this book");

    const now = Date.now();
    const dueDate = now + BORROWING_PERIOD_DAYS * 24 * 60 * 60 * 1000;

    const borrowingId = await ctx.db.insert("borrowings", {
      userId: args.userId,
      bookId: args.bookId,
      borrowDate: now,
      dueDate,
      status: "borrowed",
      extensionCount: 0,
    });

    // Update book availability
    await ctx.db.patch(args.bookId, {
      availableCopies: book.availableCopies - 1,
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId: args.userId,
      title: "Book Borrowed",
      message: `You borrowed "${book.title}". Due date: ${new Date(dueDate).toLocaleDateString()}`,
      type: "borrowing",
      isRead: false,
      createdAt: now,
    });

    return borrowingId;
  },
});

// Return a book
export const returnBook = mutation({
  args: { borrowingId: v.id("borrowings") },
  handler: async (ctx, args) => {
    const borrowing = await ctx.db.get(args.borrowingId);
    if (!borrowing) throw new Error("Borrowing not found");

    const book = await ctx.db.get(borrowing.bookId);
    if (!book) throw new Error("Book not found");

    const now = Date.now();
    const isOverdue = now > borrowing.dueDate;

    // Update borrowing
    await ctx.db.patch(borrowing._id, {
      returnDate: now,
      status: "returned",
    });

    // Update book availability
    await ctx.db.patch(borrowing.bookId, {
      availableCopies: book.availableCopies + 1,
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId: borrowing.userId,
      title: "Book Returned",
      message: `You returned "${book.title}". ${isOverdue ? "Late return fee may apply." : "Thank you!"}`,
      type: "return",
      isRead: false,
      createdAt: now,
    });

    return { success: true, isOverdue };
  },
});

// Extend borrowing period
export const extendBorrowing = mutation({
  args: { borrowingId: v.id("borrowings") },
  handler: async (ctx, args) => {
    const borrowing = await ctx.db.get(args.borrowingId);
    if (!borrowing) throw new Error("Borrowing not found");
    if (borrowing.extensionCount >= MAX_EXTENSIONS) {
      throw new Error("Maximum extensions reached");
    }

    const newDueDate = borrowing.dueDate + BORROWING_PERIOD_DAYS * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.borrowingId, {
      dueDate: newDueDate,
      extensionCount: borrowing.extensionCount + 1,
    });

    const book = await ctx.db.get(borrowing.bookId);
    if (book) {
      await ctx.db.insert("notifications", {
        userId: borrowing.userId,
        title: "Borrowing Extended",
        message: `Extended "${book.title}" until ${new Date(newDueDate).toLocaleDateString()}`,
        type: "borrowing",
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return newDueDate;
  },
});

// Check for overdue books
export const checkOverdueBooks = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const borrowings = await ctx.db
      .query("borrowings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    let overdueCount = 0;
    for (const borrowing of borrowings) {
      if (borrowing.status === "borrowed" && now > borrowing.dueDate) {
        await ctx.db.patch(borrowing._id, { status: "overdue" });
        overdueCount++;

        const book = await ctx.db.get(borrowing.bookId);
        if (book) {
          await ctx.db.insert("notifications", {
            userId: args.userId,
            title: "Book Overdue!",
            message: `"${book.title}" is overdue. Please return it as soon as possible.`,
            type: "overdue",
            isRead: false,
            createdAt: now,
          });
        }
      }
    }

    return overdueCount;
  },
});

// Get borrowing statistics for user
export const getUserBorrowingStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const borrowings = await ctx.db
      .query("borrowings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const reading = borrowings.filter((b) => b.status === "borrowed").length;
    const finished = borrowings.filter((b) => b.status === "returned").length;
    const overdue = borrowings.filter((b) => b.status === "overdue").length;

    return { reading, finished, overdue, total: borrowings.length };
  },
});
