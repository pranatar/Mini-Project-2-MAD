import { useLocalSearchParams } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  FlatList,
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
import { LoadingView, EmptyState } from "@/components/States";
import { Id } from "@/convex/_generated/dataModel";

export default function Search() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null);

  // Fetch data from Convex - only filter by category
  const allBooks = useQuery(api.books.getBooks, {
    category: selectedCategory || undefined,
  }) ?? [];

  const categories = useQuery(api.books.getCategories) ?? [];

  // Add "All" category at the beginning
  const allCategories = useMemo(() => ["All", ...categories], [categories]);

  const handleBookPress = (bookId: Id<"books">) => {
    console.log("Book pressed:", bookId);
  };

  if (!allBooks || !categories) {
    return <LoadingView message="Loading categories..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Browse by Category
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Select a category to find your books
        </Text>
      </View>

      {/* Categories Filter */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={allCategories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === item || (selectedCategory === null && item === "All")
                      ? colors.primary
                      : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(item === "All" ? null : item)}
            >
              <Ionicons
                name={
                  selectedCategory === item || (selectedCategory === null && item === "All")
                    ? "filter"
                    : "bookmark-outline"
                }
                size={16}
                color={
                  selectedCategory === item || (selectedCategory === null && item === "All")
                    ? "#fff"
                    : colors.textMuted
                }
              />
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      selectedCategory === item || (selectedCategory === null && item === "All")
                        ? "#fff"
                        : colors.text,
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Books by Category */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {selectedCategory ? selectedCategory : "All Books"}{" "}
          <Text style={[styles.count, { color: colors.textMuted }]}>
            ({allBooks.length})
          </Text>
        </Text>

        {allBooks.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No books in this category"
            message="Books will appear here once they are added to the library"
          />
        ) : (
          <FlatList
            data={allBooks}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <BookCard
                book={item}
                variant="horizontal"
                showRating={true}
                onPress={() => handleBookPress(item._id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  categoriesContainer: {
    paddingLeft: 20,
    paddingBottom: 15,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  count: {
    fontSize: 16,
    fontWeight: "normal",
  },
  resultsList: {
    paddingBottom: 20,
  },
});
