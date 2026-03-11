import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { LoadingView, EmptyState } from "@/components/States";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useCountdown, useOverdueFine } from "@/hooks/useCountdown";
import ReservedBookCard from "@/components/ReservedBookCard";
import BorrowedBookCard from "@/components/BorrowedBookCard";
import FavoriteBookCard from "@/components/FavoriteBookCard";

const { width } = Dimensions.get("window");

const tabs = [
  { id: "1", name: "Borrowed" },
  { id: "2", name: "Reserved" },
  { id: "3", name: "History" },
  { id: "4", name: "Favorites" },
];

export default function MyBooks() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("1");
  const { userId, loading: userLoading } = useAuth();

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
  const cancelReservation = useMutation(api.borrowings.cancelReservation);
  const confirmPickup = useMutation(api.borrowings.confirmPickup);
  const deleteBorrowing = useMutation(api.borrowings.deleteBorrowing);

  const handleReturn = async (borrowingId: Id<"borrowings">) => {
    try {
      await returnBook({ borrowingId });
      alert("Book returned successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to return book");
    }
  };

  const handleCancelReservation = async (borrowingId: Id<"borrowings">) => {
    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel this reservation?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelReservation({ borrowingId });
              alert("Reservation cancelled!");
            } catch (error: any) {
              alert(error.message || "Failed to cancel reservation");
            }
          }
        }
      ]
    );
  };

  const handleConfirmPickup = async (borrowingId: Id<"borrowings">) => {
    try {
      await confirmPickup({ borrowingId });
      alert("Pickup confirmed! Enjoy your book!");
    } catch (error: any) {
      alert(error.message || "Failed to confirm pickup");
    }
  };

  const handleDeleteFromHistory = async (borrowingId: Id<"borrowings">, bookTitle: string) => {
    Alert.alert(
      "Remove from History",
      `Remove "${bookTitle}" from your borrowing history?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBorrowing({ borrowingId });
              alert("Book removed from history!");
            } catch (error: any) {
              alert(error.message || "Failed to remove from history");
            }
          }
        }
      ]
    );
  };

  const handleBookPress = (bookId: Id<"books">) => {
    router.push({ pathname: `/book/[id]`, params: { id: bookId } } as any);
  };

  // Filter books based on active tab
  const readingBooks = (borrowings || []).filter((b: any) => b.status === "borrowed");
  const reservedBooks = (borrowings || []).filter((b: any) => b.status === "reserved");
  const finishedBooks = (borrowings || []).filter((b: any) => b.status === "returned");
  const favoriteBooks = favorites || [];

  // Get stats
  const stats = {
    borrowed: readingBooks.length,
    reserved: reservedBooks.length,
    history: finishedBooks.length,
    favorites: favoriteBooks.length,
  };

  if (userLoading || !borrowings || !favorites || !readingProgress) {
    return <LoadingView message="Loading your books..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Stats Header */}
      <View style={[styles.statsHeader, { backgroundColor: colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.borrowed}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Borrowed</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{stats.reserved}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Reserved</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats.history}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>History</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.danger }]}>{stats.favorites}</Text>
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
            title="No borrowed books"
            message="Reserve or borrow books from the library"
            actionLabel="Browse Books"
            onAction={() => router.push("/ebooks")}
          />
        ) : (
          <FlatList
            data={readingBooks}
            renderItem={({ item }) => (
              <BorrowedBookCard
                item={item}
                progress={(readingProgress || []).find((p: any) => p.bookId === item.bookId)}
                onPress={handleBookPress}
                onReturn={handleReturn}
                colors={colors}
              />
            )}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )
      )}
      {activeTab === "2" && (
        reservedBooks.length === 0 ? (
          <EmptyState
            icon="⏳"
            title="No reserved books"
            message="Reserve books to pick up at the library"
            actionLabel="Browse Books"
            onAction={() => router.push("/ebooks")}
          />
        ) : (
          <FlatList
            data={reservedBooks}
            renderItem={({ item }) => (
              <ReservedBookCard
                item={item}
                onPress={handleBookPress}
                onConfirmPickup={handleConfirmPickup}
                onCancel={handleCancelReservation}
                colors={colors}
              />
            )}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )
      )}
      {activeTab === "3" && (
        finishedBooks.length === 0 ? (
          <EmptyState
            icon="📜"
            title="No borrowing history"
            message="Books you've borrowed will appear here"
          />
        ) : (
          <FlatList
            data={finishedBooks}
            renderItem={({ item }) => (
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
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: colors.danger }]}
                  onPress={() => handleDeleteFromHistory(item._id, item.book.title)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )
      )}
      {activeTab === "4" && (
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
            renderItem={({ item }) => (
              <FavoriteBookCard
                item={item}
                onPress={handleBookPress}
                colors={colors}
              />
            )}
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
  dueDateContainer: {
    alignItems: "flex-end",
  },
  warningBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  warningText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  fineBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  fineText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  overdueBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 2,
  },
  overdueText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  reservedActions: {
    flexDirection: "row",
    gap: 8,
  },
  confirmButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  shelfLocationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  shelfLocationText: {
    fontSize: 11,
    fontWeight: "500",
  },
  reservedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  reservedText: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
