import { mutation } from "./_generated/server";

export const seedDatabase = mutation({
  handler: async (ctx) => {
    // Sample books data
    const books = [
      {
        title: "Atomic Habits",
        author: "James Clear",
        description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones. Tiny Changes, Remarkable Results.",
        coverImage: "📚",
        category: "Self-Help",
        isbn: "978-0735211292",
        publisher: "Avery",
        publishedYear: 2018,
        pages: 320,
        language: "English",
        rating: 4.8,
        totalCopies: 5,
        isEbook: true,
      },
      {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        description: "Timeless lessons on wealth, greed, and happiness. Doing well with money isn't necessarily about what you know.",
        coverImage: "💰",
        category: "Finance",
        isbn: "978-0857197689",
        publisher: "Harriman House",
        publishedYear: 2020,
        pages: 256,
        language: "English",
        rating: 4.7,
        totalCopies: 4,
        isEbook: true,
      },
      {
        title: "Deep Work",
        author: "Cal Newport",
        description: "Rules for Focused Success in a Distracted World. Master the art of deep work to achieve peak performance.",
        coverImage: "🎯",
        category: "Productivity",
        isbn: "978-1455586691",
        publisher: "Grand Central Publishing",
        publishedYear: 2016,
        pages: 304,
        language: "English",
        rating: 4.6,
        totalCopies: 3,
        isEbook: true,
      },
      {
        title: "Sapiens",
        author: "Yuval Noah Harari",
        description: "A Brief History of Humankind. From the Stone Age to the modern age, explore how humans conquered the world.",
        coverImage: "🌍",
        category: "History",
        isbn: "978-0062316097",
        publisher: "Harper",
        publishedYear: 2015,
        pages: 464,
        language: "English",
        rating: 4.5,
        totalCopies: 6,
        isEbook: true,
      },
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        description: "A classic American novel set in the Jazz Age. A story of wealth, love, and the American Dream.",
        coverImage: "📖",
        category: "Fiction",
        isbn: "978-0743273565",
        publisher: "Scribner",
        publishedYear: 1925,
        pages: 180,
        language: "English",
        rating: 4.4,
        totalCopies: 8,
        isEbook: true,
      },
      {
        title: "1984",
        author: "George Orwell",
        description: "A dystopian social science fiction novel. Big Brother is watching you in this totalitarian society.",
        coverImage: "📕",
        category: "Fiction",
        isbn: "978-0451524935",
        publisher: "Signet Classic",
        publishedYear: 1949,
        pages: 328,
        language: "English",
        rating: 4.7,
        totalCopies: 7,
        isEbook: true,
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        description: "A classic of modern American literature. A story of racial injustice and childhood innocence.",
        coverImage: "📗",
        category: "Fiction",
        isbn: "978-0446310789",
        publisher: "Grand Central Publishing",
        publishedYear: 1960,
        pages: 324,
        language: "English",
        rating: 4.6,
        totalCopies: 5,
        isEbook: true,
      },
      {
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        description: "The two systems that drive the way we think. Nobel Prize winner's exploration of human thought.",
        coverImage: "🧠",
        category: "Psychology",
        isbn: "978-0374533557",
        publisher: "Farrar, Straus and Giroux",
        publishedYear: 2011,
        pages: 499,
        language: "English",
        rating: 4.5,
        totalCopies: 4,
        isEbook: true,
      },
      {
        title: "The Alchemist",
        author: "Paulo Coelho",
        description: "A magical fable about following your dreams. A young shepherd's journey to find treasure.",
        coverImage: "📔",
        category: "Fiction",
        isbn: "978-0062315007",
        publisher: "HarperOne",
        publishedYear: 1988,
        pages: 208,
        language: "English",
        rating: 4.3,
        totalCopies: 6,
        isEbook: true,
      },
      {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        description: "A fantasy novel about the adventures of Bilbo Baggins. The prelude to The Lord of the Rings.",
        coverImage: "📖",
        category: "Fiction",
        isbn: "978-0547928227",
        publisher: "Mariner Books",
        publishedYear: 1937,
        pages: 310,
        language: "English",
        rating: 4.8,
        totalCopies: 5,
        isEbook: true,
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        description: "A romantic novel of manners. Elizabeth Bennet navigates issues of marriage, morality, and misconceptions.",
        coverImage: "📘",
        category: "Fiction",
        isbn: "978-0141439518",
        publisher: "Penguin Classics",
        publishedYear: 1813,
        pages: 432,
        language: "English",
        rating: 4.5,
        totalCopies: 6,
        isEbook: true,
      },
      {
        title: "The 7 Habits of Highly Effective People",
        author: "Stephen Covey",
        description: "Powerful lessons in personal change. A holistic, integrated, principle-centered approach.",
        coverImage: "🌟",
        category: "Self-Help",
        isbn: "978-1982137274",
        publisher: "Simon & Schuster",
        publishedYear: 1989,
        pages: 464,
        language: "English",
        rating: 4.6,
        totalCopies: 4,
        isEbook: true,
      },
    ];

    // Insert books
    const bookIds = [];
    for (const book of books) {
      const bookId = await ctx.db.insert("books", {
        ...book,
        totalRatings: Math.floor(Math.random() * 100) + 50,
        availableCopies: book.totalCopies,
        createdAt: Date.now(),
      });
      bookIds.push(bookId);
    }

    // Create sample users
    const adminId = await ctx.db.insert("users", {
      email: "admin@library.com",
      name: "Admin User",
      avatar: undefined,
      role: "admin",
      googleId: undefined,
      createdAt: Date.now(),
    });

    const userId = await ctx.db.insert("users", {
      email: "user@example.com",
      name: "John Doe",
      avatar: undefined,
      role: "mahasiswa",
      googleId: undefined,
      createdAt: Date.now(),
    });

    // Create some sample borrowings
    const now = Date.now();
    await ctx.db.insert("borrowings", {
      userId,
      bookId: bookIds[0],
      borrowDate: now - 7 * 24 * 60 * 60 * 1000,
      dueDate: now + 7 * 24 * 60 * 60 * 1000,
      status: "borrowed",
      extensionCount: 0,
    });

    await ctx.db.insert("borrowings", {
      userId,
      bookId: bookIds[1],
      borrowDate: now - 20 * 24 * 60 * 60 * 1000,
      dueDate: now - 6 * 24 * 60 * 60 * 1000,
      status: "overdue",
      extensionCount: 0,
    });

    // Add some favorites
    await ctx.db.insert("favorites", {
      userId,
      bookId: bookIds[0],
      createdAt: now,
    });

    await ctx.db.insert("favorites", {
      userId,
      bookId: bookIds[3],
      createdAt: now,
    });

    // Add reading progress
    await ctx.db.insert("readingProgress", {
      userId,
      bookId: bookIds[0],
      currentPage: 144,
      totalPages: 320,
      percentage: 45,
      lastReadAt: now,
    });

    // Add some reviews
    await ctx.db.insert("reviews", {
      userId,
      bookId: bookIds[3],
      rating: 5,
      comment: "Amazing book! Changed my perspective on history.",
      createdAt: now,
    });

    // Add notifications
    await ctx.db.insert("notifications", {
      userId,
      title: "Welcome to Digital Library!",
      message: "Start exploring thousands of books at your fingertips.",
      type: "system",
      isRead: false,
      createdAt: now,
    });

    await ctx.db.insert("notifications", {
      userId,
      title: "Book Due Soon",
      message: "The Psychology of Money is due in 7 days.",
      type: "return",
      isRead: false,
      createdAt: now - 2 * 24 * 60 * 60 * 1000,
    });

    return { success: true, booksCount: books.length, userId };
  },
});
