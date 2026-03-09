# Digital Library - Mobile Application 📚

A modern mobile library application built with Expo React Native and Convex backend.

## Features ✨

### Core Features
- **📖 Browse Books** - Explore books by category with beautiful grid and list views
- **🔍 Search** - Advanced search with filters by category, title, and author
- **📚 Borrowing System** - Borrow and return books with due date tracking
- **⭐ Favorites** - Save your favorite books for quick access
- **📊 Reading Progress** - Track your reading progress with percentage
- **🔔 Notifications** - Get notified about due dates, overdue books, and more
- **🌙 Dark Mode** - Toggle between light and dark themes

### User Features
- View featured and popular books
- Browse by categories (Fiction, Science, History, etc.)
- Search books by title, author, or ISBN
- Borrow books with automatic availability tracking
- Return books with overdue detection
- Extend borrowing period (up to 2 times)
- Rate and review books
- Track reading statistics
- Manage favorites collection

## Tech Stack 🛠

- **Frontend**: React Native with Expo SDK 54
- **Backend**: Convex (serverless backend)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Convex React Hooks
- **Styling**: React Native StyleSheet
- **Theme**: Custom theme provider with dark mode support
- **TypeScript**: Full type safety

## Project Structure 📁

```
mad/
├── app/                      # Expo Router pages
│   ├── (tabs)/              # Main tab navigation
│   │   ├── index.tsx        # Home screen
│   │   ├── search.tsx       # Search screen
│   │   ├── ebooks.tsx       # E-Library screen
│   │   ├── mybooks.tsx      # User's books screen
│   │   └── profile.tsx      # Profile screen
│   ├── book/
│   │   └── [id].tsx         # Book detail screen
│   ├── notifications/
│   │   └── index.tsx        # Notifications screen
│   └── _layout.tsx          # Root layout
├── components/              # Reusable components
│   ├── BookCard.tsx         # Book card component
│   └── States.tsx           # Loading, Empty, Error states
├── convex/                  # Convex backend
│   ├── books.ts             # Books queries & mutations
│   ├── borrowings.ts        # Borrowing system
│   ├── favorites.ts         # Favorites management
│   ├── notifications.ts     # Notifications system
│   ├── readingProgress.ts   # Reading progress tracking
│   ├── reviews.ts           # Reviews system
│   ├── users.ts             # User management
│   ├── schema.ts            # Database schema
│   └── seed.ts              # Sample data seeder
├── hooks/                   # Custom React hooks
│   └── useTheme.tsx         # Theme management
└── assets/                  # Images and static assets
```

## Database Schema 🗄

### Collections
- **users** - User accounts
- **books** - Book catalog
- **borrowings** - Book borrowing records
- **favorites** - User's favorite books
- **readingProgress** - Reading progress tracking
- **reviews** - Book reviews and ratings
- **notifications** - User notifications

## Getting Started 🚀

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Convex account (for backend)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mad
```

2. Install dependencies
```bash
npm install
```

3. Set up Convex backend
```bash
npx convex dev
```

4. Seed the database (optional)
```bash
npx convex run seed
```

5. Start the development server
```bash
npm start
```

### Running the App

- **iOS Simulator**: `npm run ios`
- **Android Emulator**: `npm run android`
- **Web Browser**: `npm run web`
- **Physical Device**: Scan QR code with Expo Go app

## Available Scripts 📜

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

## API Reference 🔌

### Books
- `getBooks` - Get all books with optional filters
- `getFeaturedBooks` - Get highly-rated books
- `getBookById` - Get single book details
- `getCategories` - Get all categories
- `createBook` - Add new book (admin)

### Borrowings
- `getUserBorrowings` - Get user's borrowed books
- `borrowBook` - Borrow a book
- `returnBook` - Return a borrowed book
- `extendBorrowing` - Extend borrowing period
- `checkOverdueBooks` - Check for overdue books

### Favorites
- `getUserFavorites` - Get user's favorites
- `addToFavorites` - Add book to favorites
- `removeFromFavorites` - Remove from favorites
- `isFavorite` - Check if book is favorited

### Reading Progress
- `getUserReadingProgress` - Get all reading progress
- `getBookProgress` - Get progress for specific book
- `updateReadingProgress` - Update reading progress

### Notifications
- `getUserNotifications` - Get user notifications
- `markNotificationAsRead` - Mark as read
- `markAllNotificationsAsRead` - Mark all as read
- `getUnreadCount` - Get unread count

## UI Components 🎨

### BookCard
Reusable component for displaying book information.

```tsx
<BookCard
  book={bookData}
  variant="default" | "compact" | "horizontal"
  showRating={true}
  showAvailability={true}
  onPress={() => handlePress()}
/>
```

### States
Loading, Empty, and Error state components.

```tsx
<LoadingView message="Loading..." />
<EmptyState icon="📚" title="No books" message="Try again" />
<ErrorState message="Error occurred" onRetry={() => retry()} />
```

## Theme 🎨

The app supports both light and dark modes with a custom theme provider.

### Colors
- Primary: Blue (#3b82f6)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Danger: Red (#ef4444)

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License.

## Acknowledgments 🙏

- Built with [Expo](https://expo.dev/)
- Backend by [Convex](https://convex.dev/)
- Icons by [Ionicons](https://ionic.io/ionicons)
