import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { LoadingView, EmptyState } from "@/components/States";
import { Id } from "@/convex/_generated/dataModel";

const { width } = Dimensions.get("window");

const tabs = [
  { id: "1", name: "Reading" },
  { id: "2", name: "Finished" },
  { id: "3", name: "Favorites" },
];

export default function MyBooks() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("1");

  // Placeholder user ID - in real app, get from auth context
  const userId = "sample-user-id" as Id<"users">;

  // Fetch user's borrowings
  const borrowings = useQuery(
    api.borrowings.getUserBorrowings,
    userId ? { userId } : "skip"
  );

  // Fetch user's favorites
  const favorites = useQuery(
    api.favorites.getUserFavorites,
    userId ? { userId } : "skip"
  );

  // Fetch user's reading progress
  const readingProgress = useQuery(
    api.readingProgress.getUserReadingProgress,
    userId ? { userId } : "skip"
  );

  const returnBook = useMutation(api.borrowings.returnBook);

  const handleReturn = async (borrowingId: Id<"borrowings">) => {
    try {
      await returnBook({ borrowingId });
      alert("Book returned successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to return book");
    }
  };

  const handleBookPress = (bookId: Id<"books">) => {
    router.push({ pathname: `/book/[id]`, params: { id: bookId } } as any);
  };

  // Filter books based on active tab
  const readingBooks = (borrowings || []).filter((b: any) => b.status === "borrowed");
  const finishedBooks = (borrowings || []).filter((b: any) => b.status === "returned");
  const favoriteBooks = favorites || [];

  // Get stats
  const stats = {
    reading: readingBooks.length,
    finished: finishedBooks.length,
    favorites: favoriteBooks.length,
  };

  if (!borrowings || !favorites || !readingProgress) {
    return <LoadingView message="Loading your books..." />;
  }

  const renderReadingBook = ({ item }: { item: typeof readingBooks[0] }) => {
    const progress = (readingProgress || []).find((p: any) => p.bookId === item.bookId);
    const percentage = progress?.percentage || 0;

    return (
      <TouchableOpacity
        style={[styles.bookCard, { backgroundColor: colors.surface }]}
        onPress={() => handleBookPress(item.book._id)}
      >
        <View
          style={[
            styles.bookCover,
            { backgroundColor: colors.gradients.primary[0] },
          ]}
        >
          <Text style={styles.bookEmoji}>{item.book.coverImage}</Text>
        </View>
        <View style={styles.bookInfo}>
          <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
            {item.book.title}
          </Text>
          <Text style={[styles.bookAuthor, { color: colors.textMuted }]} numberOfLines={1}>
            {item.book.author}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: `${percentage}%` as any },
              ]}
            />
          </View>
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: colors.textMuted }]}>
              {percentage}% complete
            </Text>
            <Text style={[styles.dueDate, { color: item.status === "overdue" ? colors.danger : colors.textMuted }]}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleReturn(item._id)}
        >
          <Ionicons name="return-up-back-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderFinishedBook = ({ item }: { item: typeof finishedBooks[0] }) => (
    <TouchableOpacity
      style={[styles.bookCard, { backgroundColor: colors.surface }]}
      onPress={() => handleBookPress(item.book._id)}
    >
      <View
        style={[
          styles.bookCover,
          { backgroundColor: colors.gradients.success[0] },
        ]}
      >
        <Text style={styles.bookEmoji}>{item.book.coverImage}</Text>
      </View>
      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
          {item.book.title}
        </Text>
        <Text style={[styles.bookAuthor, { color: colors.textMuted }]} numberOfLines={1}>
          {item.book.author}
        </Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= 5 ? "star" : "star-outline"}
              size={14}
              color="#fbbf24"
            />
          ))}
        </View>
        <Text style={[styles.finishedDate, { color: colors.textMuted }]}>
          Returned: {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : "N/A"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFavoriteBook = ({ item }: { item: typeof favoriteBooks[0] }) => (
    <TouchableOpacity
      style={[styles.favoriteCard, { backgroundColor: colors.surface }]}
      onPress={() => handleBookPress(item.book._id)}
    >
      <View
        style={[
          styles.bookCover,
          { backgroundColor: colors.gradients.warning[0] },
        ]}
      >
        <Text style={styles.bookEmoji}>{item.book.coverImage}</Text>
      </View>
      <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
        {item.book.title}
      </Text>
      <Text style={[styles.bookAuthor, { color: colors.textMuted }]} numberOfLines={1}>
        {item.book.author}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Stats Header */}
      <View style={[styles.statsHeader, { backgroundColor: colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.reading}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Reading</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats.finished}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Finished</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{stats.favorites}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Favorites</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={tabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                {
                  backgroundColor:
                    activeTab === item.id ? colors.primary : "transparent",
                },
              ]}
              onPress={() => setActiveTab(item.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === item.id ? "#fff" : colors.text,
                  },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Content */}
      {activeTab === "1" && (
        readingBooks.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No books being read"
            message="Start borrowing books to see them here"
            actionLabel="Browse Books"
            onAction={() => router.push("/ebooks")}
          />
        ) : (
          <FlatList
            data={readingBooks}
            renderItem={renderReadingBook}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )
      )}
      {activeTab === "2" && (
        finishedBooks.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No finished books"
            message="Books you've returned will appear here"
          />
        ) : (
          <FlatList
            data={finishedBooks}
            renderItem={renderFinishedBook}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )
      )}
      {activeTab === "3" && (
        favoriteBooks.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="No favorites yet"
            message="Add books to favorites to see them here"
            actionLabel="Explore Books"
            onAction={() => router.push("/ebooks")}
          />
        ) : (
          <FlatList
            data={favoriteBooks}
            renderItem={renderFavoriteBook}
            keyExtractor={(item) => item._id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.favoritesList}
            columnWrapperStyle={styles.favoritesRow}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bookCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  bookCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  bookEmoji: {
    fontSize: 28,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 13,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  progressText: {
    fontSize: 11,
  },
  dueDate: {
    fontSize: 11,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  ratingRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  finishedDate: {
    fontSize: 11,
    marginTop: 4,
  },
  favoritesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  favoritesRow: {
    justifyContent: "space-between",
  },
  favoriteCard: {
    width: (width - 60) / 3,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
});
