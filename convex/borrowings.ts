import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const BORROWING_PERIOD_DAYS = 14;
const MAX_EXTENSIONS = 2;
const FINE_PER_DAY = 1000;
const RESERVE_HOLD_HOURS = 48; // Reserve held for 48 hours

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
    const now = Date.now();
    
    for (const borrowing of borrowings) {
      const book = await ctx.db.get(borrowing.bookId);
      if (book) {
        let currentFine = 0;
        if (borrowing.status !== "returned" && now > borrowing.dueDate) {
          const daysOverdue = Math.ceil((now - borrowing.dueDate) / (24 * 60 * 60 * 1000));
          currentFine = daysOverdue * FINE_PER_DAY;
        }

        result.push({ 
          ...borrowing, 
          book,
          currentFine,
          daysLeft: Math.ceil((borrowing.dueDate - now) / (24 * 60 * 60 * 1000))
        });
      }
    }

    return result.reverse();
  },
});

// Borrow a book (for physical pickup)
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
      message: `You borrowed "${book.title}". Pick up at ${book.floor}, ${book.section}, Shelf ${book.shelfLocation}. Due date: ${new Date(dueDate).toLocaleDateString()}`,
      type: "borrowing",
      isRead: false,
      createdAt: now,
    });

    return borrowingId;
  },
});

// Reserve a book for pickup (hold for 48 hours)
export const reserveForPickup = mutation({
  args: { userId: v.id("users"), bookId: v.id("books") },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    if (!book) throw new Error("Book not found");
    if (book.availableCopies <= 0) throw new Error("Book not available");

    // Check if book is already reserved
    if (book.isReserved) throw new Error("This book is already reserved by someone");

    // Check if user already has a reservation
    const existingReservation = await ctx.db
      .query("borrowings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.and(
        q.eq(q.field("bookId"), args.bookId),
        q.eq(q.field("status"), "reserved")
      ))
      .first();

    if (existingReservation) throw new Error("You already have a reservation for this book");

    const now = Date.now();
    const reservedUntil = now + RESERVE_HOLD_HOURS * 60 * 60 * 1000;

    // Create reservation
    const reservationId = await ctx.db.insert("borrowings", {
      userId: args.userId,
      bookId: args.bookId,
      borrowDate: now,
      dueDate: reservedUntil,
      status: "reserved",
      extensionCount: 0,
    });

    // Mark book as reserved
    await ctx.db.patch(args.bookId, {
      isReserved: true,
      reservedBy: args.userId,
      reservedUntil,
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId: args.userId,
      title: "Book Reserved! 📚",
      message: `"${book.title}" is reserved for you. Pick up within 48 hours at ${book.floor}, ${book.section}, Shelf ${book.shelfLocation}.`,
      type: "borrowing",
      isRead: false,
      createdAt: now,
    });

    return reservationId;
  },
});

// Confirm pickup of reserved book (convert to borrowing)
export const confirmPickup = mutation({
  args: { borrowingId: v.id("borrowings") },
  handler: async (ctx, args) => {
    const borrowing = await ctx.db.get(args.borrowingId);
    if (!borrowing) throw new Error("Reservation not found");
    if (borrowing.status !== "reserved") throw new Error("This is not a reservation");

    const book = await ctx.db.get(borrowing.bookId);
    if (!book) throw new Error("Book not found");

    const now = Date.now();
    const dueDate = now + BORROWING_PERIOD_DAYS * 24 * 60 * 60 * 1000;

    // Convert reservation to borrowing
    await ctx.db.patch(args.borrowingId, {
      status: "borrowed",
      dueDate,
      borrowDate: now,
    });

    // Update book availability
    await ctx.db.patch(book._id, {
      availableCopies: book.availableCopies - 1,
      isReserved: false,
      reservedBy: undefined,
      reservedUntil: undefined,
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId: borrowing.userId,
      title: "Pickup Confirmed! ✅",
      message: `You now have "${book.title}". Due date: ${new Date(dueDate).toLocaleDateString()}`,
      type: "borrowing",
      isRead: false,
      createdAt: now,
    });

    return { success: true, dueDate };
  },
});

// Cancel reservation
export const cancelReservation = mutation({
  args: { borrowingId: v.id("borrowings") },
  handler: async (ctx, args) => {
    const borrowing = await ctx.db.get(args.borrowingId);
    if (!borrowing) throw new Error("Reservation not found");
    if (borrowing.status !== "reserved") throw new Error("Not a reservation");

    const book = await ctx.db.get(borrowing.bookId);
    if (!book) throw new Error("Book not found");

    // Delete reservation
    await ctx.db.delete(args.borrowingId);

    // Unmark book as reserved
    await ctx.db.patch(borrowing.bookId, {
      isReserved: false,
      reservedBy: undefined,
      reservedUntil: undefined,
    });

    return { success: true };
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

// Internal function to check for upcoming deadlines (e.g., 1 day before)
export const checkUpcomingDeadlines = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const warningWindow = now + oneDayInMs;

    const upcoming = await ctx.db
      .query("borrowings")
      .filter((q) => q.and(
        q.eq(q.field("status"), "borrowed"),
        q.lte(q.field("dueDate"), warningWindow),
        q.gt(q.field("dueDate"), now)
      ))
      .collect();

    for (const borrow of upcoming) {
      const book = await ctx.db.get(borrow.bookId);
      if (book) {
        // Only notify once if possible (optional refinement: check if already notified)
        await ctx.db.insert("notifications", {
          userId: borrow.userId,
          title: "Upcoming Deadline",
          message: `Your book "${book.title}" is due tomorrow! Please return or extend it to avoid fines.`,
          type: "borrowing",
          isRead: false,
          createdAt: now,
        });
      }
    }
  },
});

// Internal function to process overdue books and send daily fine updates
export const processOverdueBooks = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const overdue = await ctx.db
      .query("borrowings")
      .filter((q) => q.and(
        q.or(q.eq(q.field("status"), "borrowed"), q.eq(q.field("status"), "overdue")),
        q.lt(q.field("dueDate"), now)
      ))
      .collect();

    for (const borrow of overdue) {
      const book = await ctx.db.get(borrow.bookId);
      if (book) {
        const daysOverdue = Math.ceil((now - borrow.dueDate) / (24 * 60 * 60 * 1000));
        const currentFine = daysOverdue * FINE_PER_DAY;

        // Update status to overdue if not already
        if (borrow.status !== "overdue") {
          await ctx.db.patch(borrow._id, { status: "overdue" });
        }

        // Daily fine notification
        await ctx.db.insert("notifications", {
          userId: borrow.userId,
          title: "Book Overdue!",
          message: `"${book.title}" is overdue by ${daysOverdue} day(s). Current fine: Rp ${currentFine.toLocaleString("id-ID")}.`,
          type: "overdue",
          isRead: false,
          createdAt: now,
        });
      }
    }
  },
});

// Check for expired reservations and auto-cancel (cron job)
export const checkExpiredReservations = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredReservations = await ctx.db
      .query("borrowings")
      .filter((q) => q.and(
        q.eq(q.field("status"), "reserved"),
        q.lt(q.field("dueDate"), now)
      ))
      .collect();

    let cancelledCount = 0;

    for (const reservation of expiredReservations) {
      const book = await ctx.db.get(reservation.bookId);
      
      // Cancel reservation
      await ctx.db.delete(reservation._id);

      // Unmark book as reserved
      if (book) {
        await ctx.db.patch(book._id, {
          isReserved: false,
          reservedBy: undefined,
          reservedUntil: undefined,
        });

        // Send notification to user
        await ctx.db.insert("notifications", {
          userId: reservation.userId,
          title: "Reservation Expired",
          message: `Your reservation for "${book.title}" has expired. The book is now available for others.`,
          type: "system",
          isRead: false,
          createdAt: now,
        });
      }

      cancelledCount++;
    }

    return { cancelledCount };
  },
});
