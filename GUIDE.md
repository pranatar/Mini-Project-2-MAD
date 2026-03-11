# 📚 Digital Library App - Complete Guide

## 📖 Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Core Features](#core-features)
4. [Feature Details](#feature-details)
5. [Code Explanation](#code-explanation)
6. [Deployment Guide](#deployment-guide)

---

## 🎯 Overview

**Aplikasi Library Management System** dengan fokus pada **kunjungan fisik ke perpustakaan**, bukan digital library.

### 🎓 Target User:
- **Mahasiswa** - Reserve & pinjam buku fisik
- **Admin** - Manage books, users, borrowings

### 💡 Key Concept:
```
┌─────────────────────────────────────────┐
│  RESERVE di App → PICKUP di Perpus     │
│                                         │
│  Bukan e-book, tapi buku FISIK!        │
└─────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
mad/
├── app/                          # Main application code
│   ├── (tabs)/                   # Tab navigation (user)
│   │   ├── index.tsx            # Home page
│   │   ├── ebooks.tsx           # Browse books
│   │   ├── mybooks.tsx          # User books (borrowed/reserved)
│   │   └── profile.tsx          # User profile
│   ├── admin/                    # Admin pages
│   │   ├── dashboard.tsx        # Admin dashboard
│   │   ├── books.tsx            # Manage books
│   │   ├── borrowings.tsx       # Manage borrowings
│   │   └── users.tsx            # Manage users
│   └── book/[id].tsx            # Book detail page
│
├── components/                   # Reusable components
│   ├── BookCard.tsx             # Book card component
│   ├── ReservedBookCard.tsx     # Reserved book card
│   ├── BorrowedBookCard.tsx     # Borrowed book card
│   ├── FavoriteBookCard.tsx     # Favorite book card
│   └── ReservationCard.tsx      # Reservation card (home)
│
├── convex/                       # Backend (Convex)
│   ├── schema.ts                # Database schema
│   ├── books.ts                 # Book queries/mutations
│   ├── borrowings.ts            # Borrowing logic
│   ├── admin.ts                 # Admin functions
│   └── crons.ts                 # Scheduled jobs
│
├── hooks/                        # Custom React hooks
│   ├── useTheme.ts              # Dark/light mode
│   └── useCountdown.ts          # Real-time countdown
│
├── utils/                        # Utility functions
│   └── timeHelpers.ts           # Time calculations
│
└── contexts/                     # React contexts
    └── AuthContext.tsx          # Authentication
```

---

## 🚀 Core Features

### 1. **Reserve for Pickup** 📚
**File:** `app/book/[id].tsx`

**Flow:**
```
User buka app
    ↓
Pilih buku
    ↓
Tap "Reserve for Pickup"
    ↓
Buku di-hold 48 jam
    ↓
User datang ke perpus
    ↓
Ambil buku di rak (Floor 2, Section A, Shelf A-101)
    ↓
Confirm pickup di counter
    ↓
Status: Reserved → Borrowed (14 hari)
```

**Code:**
```typescript
// convex/borrowings.ts
export const reserveForPickup = mutation({
  args: { userId: v.id("users"), bookId: v.id("books") },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    
    // Check availability
    if (book.availableCopies <= 0) {
      throw new Error("Book not available");
    }
    
    // Create reservation (48 hours)
    const reservedUntil = Date.now() + (48 * 60 * 60 * 1000);
    
    await ctx.db.insert("borrowings", {
      userId: args.userId,
      bookId: args.bookId,
      status: "reserved",
      dueDate: reservedUntil,
    });
    
    // Mark book as reserved
    await ctx.db.patch(args.bookId, {
      isReserved: true,
      reservedBy: args.userId,
    });
  },
});
```

---

### 2. **Shelf Location System** 📍

**File:** `convex/schema.ts`

**Schema:**
```typescript
books: defineTable({
  title: v.string(),
  author: v.string(),
  // ... other fields
  shelfLocation: v.optional(v.string()),  // "A-101"
  floor: v.optional(v.string()),          // "Floor 2"
  section: v.optional(v.string()),        // "Section A"
})
```

**UI Display:**
```typescript
// app/book/[id].tsx
{book.floor && book.section && book.shelfLocation && (
  <View style={styles.shelfLocationCard}>
    <View style={styles.shelfRow}>
      <Ionicons name="layers" size={16} />
      <Text>{book.floor}</Text>
    </View>
    <View style={styles.shelfRow}>
      <Ionicons name="grid" size={16} />
      <Text>{book.section}</Text>
    </View>
    <View style={styles.shelfRow}>
      <Ionicons name="bookmark" size={16} />
      <Text>Shelf {book.shelfLocation}</Text>
    </View>
  </View>
)}
```

---

### 3. **Real-time Countdown** ⏰

**File:** `hooks/useCountdown.ts`

**Hook:**
```typescript
import { useState, useEffect } from "react";

export const useCountdown = (dueDate: number, interval = 1000) => {
  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(dueDate)
  );

  useEffect(() => {
    // Update immediately
    setTimeRemaining(calculateTimeRemaining(dueDate));
    
    // Update every interval
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(dueDate));
    }, interval);
    
    return () => clearInterval(timer);
  }, [dueDate, interval]);

  return timeRemaining;
};
```

**Usage:**
```typescript
// app/(tabs)/mybooks.tsx
const ReservedBookCard = ({ item }) => {
  const countdown = useCountdown(item.dueDate, 1000); // Update every 1s
  
  return (
    <View>
      <Text>
        {countdown.isOverdue ? "Overdue!" : `Pickup in ${countdown.text}`}
      </Text>
    </View>
  );
};
```

---

### 4. **Auto-cancel Expired Reservations** 🤖

**File:** `convex/borrowings.ts` + `convex/crons.ts`

**Cron Job (runs every hour):**
```typescript
// convex/borrowings.ts
export const checkExpiredReservations = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find expired reservations
    const expired = await ctx.db
      .query("borrowings")
      .filter((q) => q.and(
        q.eq(q.field("status"), "reserved"),
        q.lt(q.field("dueDate"), now)
      ))
      .collect();
    
    for (const reservation of expired) {
      // Cancel reservation
      await ctx.db.delete(reservation._id);
      
      // Free up book
      await ctx.db.patch(reservation.bookId, {
        isReserved: false,
        reservedBy: undefined,
      });
    }
  },
});

// convex/crons.ts
crons.interval(
  "check-expired-reservations",
  { hours: 1 },
  api.borrowings.checkExpiredReservations
);
```

---

### 5. **Delete from History** 🗑️

**File:** `app/(tabs)/mybooks.tsx`

**Mutation:**
```typescript
export const deleteBorrowing = mutation({
  args: { borrowingId: v.id("borrowings") },
  handler: async (ctx, args) => {
    const borrowing = await ctx.db.get(args.borrowingId);
    
    // Only allow deleting returned books
    if (borrowing.status !== "returned") {
      throw new Error("Can only delete returned books");
    }
    
    await ctx.db.delete(args.borrowingId);
    return { success: true };
  },
});
```

**UI:**
```typescript
const handleDeleteFromHistory = async (borrowingId, bookTitle) => {
  Alert.alert(
    "Remove from History",
    `Remove "${bookTitle}" from history?`,
    [
      { text: "Cancel" },
      {
        text: "Remove",
        onPress: async () => {
          await deleteBorrowing({ borrowingId });
          alert("Book removed!");
        }
      }
    ]
  );
};
```

---

### 6. **Admin Dashboard Stats** 📊

**File:** `convex/admin.ts`

**Query:**
```typescript
export const getStats = query({
  handler: async (ctx) => {
    const books = await ctx.db.query("books").collect();
    const users = await ctx.db.query("users").collect();
    const borrowings = await ctx.db.query("borrowings").collect();
    
    return {
      totalBooks: books.length,
      totalUsers: users.length,
      activeBorrowings: borrowings.filter(b => b.status === "borrowed").length,
      overdueBorrowings: borrowings.filter(b => b.status === "overdue").length,
      reservedBorrowings: borrowings.filter(b => b.status === "reserved").length,
    };
  },
});
```

**UI:**
```typescript
// app/(tabs)/profile.tsx
{isAdmin ? (
  <>
    <StatCard icon="library" value={totalBooks} label="Total Books" />
    <StatCard icon="people" value={totalUsers} label="Total Users" />
    <StatCard icon="time" value={overdueBooks} label="Overdue" />
  </>
) : (
  <>
    <StatCard icon="book" value={readingCount} label="Reading" />
    <StatCard icon="checkmark" value={finishedCount} label="Finished" />
  </>
)}
```

---

## 🔧 Code Explanation

### **Why Components for FlatList Items?**

**❌ WRONG - Hook in renderItem:**
```typescript
<FlatList
  data={books}
  renderItem={({ item }) => {
    const countdown = useCountdown(item.dueDate); // ❌ ERROR!
    return <View>...</View>;
  }}
/>
```

**✅ RIGHT - Separate Component:**
```typescript
// Create component
const BookCard = ({ item }) => {
  const countdown = useCountdown(item.dueDate); // ✅ OK!
  return <View>...</View>;
};

// Use in FlatList
<FlatList
  data={books}
  renderItem={({ item }) => <BookCard item={item} />}
/>
```

**Reason:** React Hooks can only be called at the top level of a component, not inside callbacks or loops.

---

### **Why Optional Fields in Schema?**

```typescript
books: defineTable({
  shelfLocation: v.optional(v.string()), // ✅ Optional
  floor: v.optional(v.string()),         // ✅ Optional
})
```

**Reason:** Existing books in database don't have these fields. Making them optional prevents validation errors.

---

### **Why Real-time Updates?**

```typescript
// Countdown updates every 1 second
const countdown = useCountdown(dueDate, 1000);
```

**Benefits:**
- User sees exact time remaining
- No need to refresh page
- Better UX for time-sensitive actions (reservations)

---

## 📦 Deployment Guide

### **1. Deploy to Convex**
```bash
npx convex dev
```

This will:
- Upload all functions
- Update database schema
- Sync data

### **2. Start Expo**
```bash
npx expo start
```

### **3. Test Features**

**Reserve Flow:**
1. Login as user
2. Browse books
3. Tap book → "Reserve for Pickup"
4. Check "My Books → Reserved"
5. See countdown updating

**Admin Flow:**
1. Login as admin
2. Go to Admin Dashboard
3. See real-time stats
4. Manage books/users

---

## 🎓 Key Learnings

### **1. React Hooks Rules**
- ✅ Call at top level
- ✅ Don't call in loops/conditions
- ✅ Use custom hooks for reusability

### **2. Real-time Data**
- ✅ Convex auto-syncs data
- ✅ Use hooks for live updates
- ✅ Cron jobs for background tasks

### **3. Component Architecture**
- ✅ Separate components for FlatList items
- ✅ Reusable UI components
- ✅ Clean separation of concerns

---

## 📞 Support

For questions or issues:
1. Check console logs
2. Verify Convex deployment
3. Check database schema matches code

---

**Happy Coding! 🚀**
