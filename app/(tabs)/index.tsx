import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import BookCard from "@/components/BookCard";
import { LoadingView } from "@/components/States";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useCountdown } from "@/hooks/useCountdown";
import ReservationCard from "@/components/ReservationCard";

export default function Index() {
  const router = useRouter();
  const { userId } = useAuth();
  const { colors, toggleDarkMode, isDarkMode } = useTheme();

  // Fetch data from Convex
  const featuredBooks = useQuery(api.books.getFeaturedBooks, { limit: 10 }) ?? [];
  const categories = useQuery(api.books.getCategories) ?? [];
  const unreadNotifications = useQuery(api.notifications.getUnreadCount, userId ? { userId } : "skip");
  const borrowings = useQuery(api.borrowings.getUserBorrowings, userId ? { userId } : "skip");

  const activeBorrowings = (borrowings || []).filter((b: any) => b.status === "borrowed");
  const reservedBooks = (borrowings || []).filter((b: any) => b.status === "reserved");

  const handleBookPress = (bookId: Id<"books">) => {
    router.push({ pathname: `/book/[id]`, params: { id: bookId } } as any);
  };

  const handleCategoryPress = (category: string) => {
    router.push(`/search?category=${encodeURIComponent(category)}`);
  };

  if (!featuredBooks || !categories) {
    return <LoadingView message="Loading library..." />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={[styles.greeting, { color: colors.textMuted }]}>
            Welcome back! 👋
          </Text>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Discover Your Next
          </Text>
          <Text style={[styles.welcomeTitle, { color: colors.primary }]}>
            Great Read
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push("/notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.text}
            />
            {unreadNotifications && unreadNotifications > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                <Text style={styles.badgeText}>
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.darkModeButton, { backgroundColor: colors.surface }]}
            onPress={toggleDarkMode}
          >
            <Ionicons
              name={isDarkMode ? "sunny" : "moon"}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.gradients.primary[0] }]}
          onPress={() => router.push("/search")}
        >
          <Ionicons name="search" size={24} color="#fff" />
          <Text style={styles.actionText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.gradients.success[0] }]}
          onPress={() => router.push("/ebooks")}
        >
          <Ionicons name="library" size={24} color="#fff" />
          <Text style={styles.actionText}>E-Library</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.gradients.warning[0] }]}
          onPress={() => router.push("/mybooks")}
        >
          <Ionicons name="bookmark" size={24} color="#fff" />
          <Text style={styles.actionText}>My Books</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#8b5cf6" }]}
          onPress={() => router.push("/library-map")}
        >
          <Ionicons name="map" size={24} color="#fff" />
          <Text style={styles.actionText}>Library Map</Text>
        </TouchableOpacity>
      </View>

      {/* Your Reservations */}
      {reservedBooks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              ⏳ Your Reservations
            </Text>
            <TouchableOpacity onPress={() => router.push("/mybooks")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={reservedBooks.slice(0, 3)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ReservationCard
                item={item}
                onPress={handleBookPress}
                colors={colors}
              />
            )}
          />
        </View>
      )}

      {/* Your Borrowings */}
      {activeBorrowings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📖 Your Borrowed Books
            </Text>
            <TouchableOpacity onPress={() => router.push("/mybooks")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={activeBorrowings.slice(0, 3)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.borrowingCard, { backgroundColor: colors.surface }]}
                onPress={() => handleBookPress(item.book._id)}
              >
                <View style={[styles.borrowingCover, { backgroundColor: colors.gradients.primary[0] }]}>
                  <Text style={styles.borrowingEmoji}>{item.book.coverImage}</Text>
                </View>
                <View style={styles.borrowingInfo}>
                  <Text style={[styles.borrowingTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.book.title}
                  </Text>
                  <Text style={[styles.borrowingAuthor, { color: colors.textMuted }]} numberOfLines={1}>
                    {item.book.author}
                  </Text>
                  <View style={styles.dueDateRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.danger} />
                    <Text style={[styles.dueDateText, { color: colors.danger }]}>
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                  {item.daysLeft <= 3 && (
                    <View style={[styles.urgentBadge, { backgroundColor: `${colors.danger}20` }]}>
                      <Text style={[styles.urgentText, { color: colors.danger }]}>
                        {item.daysLeft === 0 ? "Due today!" : `${item.daysLeft} days left`}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Quick Borrow - Available Books */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📚 Borrow a Book
          </Text>
          <TouchableOpacity onPress={() => router.push("/ebooks")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={featuredBooks.slice(0, 5)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.quickBorrowCard, { backgroundColor: colors.surface }]}
              onPress={() => handleBookPress(item._id)}
            >
              <View style={[styles.quickBorrowCover, { backgroundColor: colors.gradients.primary[0] }]}>
                <Text style={styles.quickBorrowEmoji}>{item.coverImage}</Text>
              </View>
              <View style={styles.quickBorrowInfo}>
                <Text style={[styles.quickBorrowTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.quickBorrowAuthor, { color: colors.textMuted }]} numberOfLines={1}>
                  {item.author}
                </Text>
                <View style={styles.availabilityRow}>
                  <Ionicons 
                    name={item.availableCopies > 0 ? "checkmark-circle" : "close-circle"} 
                    size={14} 
                    color={item.availableCopies > 0 ? colors.success : colors.danger} 
                  />
                  <Text style={[
                    styles.availabilityText,
                    { color: item.availableCopies > 0 ? colors.success : colors.danger }
                  ]}>
                    {item.availableCopies > 0 ? `${item.availableCopies} left` : "Out"}
                  </Text>
                </View>
                {item.availableCopies > 0 && (
                  <View style={[styles.borrowBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.borrowBadgeText}>Borrow Now</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Browse Categories
        </Text>
        <View style={styles.categoriesGrid}>
          {categories.slice(0, 4).map((category: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={[styles.categoryCard, { backgroundColor: colors.surface }]}
              onPress={() => handleCategoryPress(category)}
            >
              <Ionicons name="book-outline" size={28} color={colors.primary} />
              <Text style={[styles.categoryName, { color: colors.text }]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured Books */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  darkModeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  actionButton: {
    width: "48%" as any,
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    marginTop: 8,
    fontSize: 13,
  },
  section: {
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  lastSection: {
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%" as any,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  featuredList: {
    paddingRight: 20,
  },
  continueCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  continueCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  continueInfo: {
    flex: 1,
    marginLeft: 12,
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  continueAuthor: {
    fontSize: 13,
    marginTop: 2,
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
  progressText: {
    fontSize: 11,
    marginTop: 4,
  },
  borrowingCard: {
    width: 200,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  borrowingCover: {
    width: 50,
    height: 70,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  borrowingEmoji: {
    fontSize: 32,
  },
  borrowingInfo: {
    flex: 1,
  },
  borrowingTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  borrowingAuthor: {
    fontSize: 12,
    marginBottom: 6,
  },
  dueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  dueDateText: {
    fontSize: 11,
    fontWeight: "500",
  },
  urgentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  urgentText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  quickBorrowCard: {
    width: 180,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickBorrowCover: {
    width: 50,
    height: 70,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  quickBorrowEmoji: {
    fontSize: 32,
  },
  quickBorrowInfo: {
    flex: 1,
  },
  quickBorrowTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  quickBorrowAuthor: {
    fontSize: 12,
    marginBottom: 6,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: "500",
  },
  borrowBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  borrowBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  bookEmoji: {
    fontSize: 40,
  },
});
