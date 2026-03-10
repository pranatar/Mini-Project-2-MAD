import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
    role: v.union(v.literal("mahasiswa"), v.literal("admin")),
    googleId: v.optional(v.string()),
  }).index("by_email", ["email"]).index("by_google_id", ["googleId"]),

  // Books table
  books: defineTable({
    title: v.string(),
    author: v.string(),
    description: v.string(),
    coverImage: v.string(),
    category: v.string(),
    isbn: v.string(),
    publisher: v.string(),
    publishedYear: v.number(),
    pages: v.number(),
    language: v.string(),
    rating: v.number(),
    totalRatings: v.number(),
    availableCopies: v.number(),
    totalCopies: v.number(),
    isEbook: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_author", ["author"])
    .index("by_title", ["title"]),

  // Borrowings table (peminjaman)
  borrowings: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),
    borrowDate: v.number(),
    dueDate: v.number(),
    returnDate: v.optional(v.number()),
    status: v.union(
      v.literal("borrowed"),
      v.literal("returned"),
      v.literal("overdue")
    ),
    extensionCount: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_book", ["bookId"])
    .index("by_user_status", ["userId", "status"]),

  // Reviews table
  reviews: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.number(),
  })
    .index("by_book", ["bookId"])
    .index("by_user", ["userId"]),

  // Favorites/Bookmarks table
  favorites: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_book", ["userId", "bookId"]),

  // Reading progress table
  readingProgress: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),
    currentPage: v.number(),
    totalPages: v.number(),
    percentage: v.number(),
    lastReadAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_book", ["userId", "bookId"]),

  // Notifications table
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("borrowing"),
      v.literal("return"),
      v.literal("overdue"),
      v.literal("available"),
      v.literal("system")
    ),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"]),
});
