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

export default function Index() {
  const router = useRouter();
  const { colors, toggleDarkMode, isDarkMode } = useTheme();

  // Fetch data from Convex
  const featuredBooks = useQuery(api.books.getFeaturedBooks, { limit: 10 }) ?? [];
  const categories = useQuery(api.books.getCategories) ?? [];

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
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Featured Books
          </Text>
          <TouchableOpacity onPress={() => router.push("/ebooks")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={featuredBooks}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              variant="default"
              onPress={() => handleBookPress(item._id)}
            />
          )}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        />
      </View>

      {/* Continue Reading - Placeholder */}
      <View style={[styles.section, styles.lastSection]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Continue Reading
        </Text>
        <TouchableOpacity style={[styles.continueCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.continueCover, { backgroundColor: colors.gradients.primary[0] }]}>
            <Text style={styles.bookEmoji}>📚</Text>
          </View>
          <View style={styles.continueInfo}>
            <Text style={[styles.continueTitle, { color: colors.text }]}>
              Atomic Habits
            </Text>
            <Text style={[styles.continueAuthor, { color: colors.textMuted }]}>
              James Clear
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.primary, width: "45%" as any },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textMuted }]}>
              45% complete
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
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
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  actionButton: {
    width: 100,
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
  bookEmoji: {
    fontSize: 40,
  },
});
