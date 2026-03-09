import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
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

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 2;
const ITEM_MARGIN = 12;

export default function Ebooks() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from Convex
  const allBooks = useQuery(api.books.getBooks, {
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  }) ?? [];

  const categories = useQuery(api.books.getCategories) ?? [];

  const handleBookPress = (bookId: Id<"books">) => {
    router.push({ pathname: `/book/[id]`, params: { id: bookId } } as any);
  };

  if (!allBooks || !categories) {
    return <LoadingView message="Loading library..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            placeholder="Search in library..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryTab,
                {
                  backgroundColor: selectedCategory === item ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  {
                    color: selectedCategory === item ? "#fff" : colors.text,
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Books Grid */}
      {allBooks.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No books found"
          message="Try selecting a different category or search term"
        />
      ) : (
        <FlatList
          data={allBooks}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              variant="compact"
              onPress={() => handleBookPress(item._id)}
            />
          )}
          keyExtractor={(item) => item._id}
          numColumns={COLUMN_COUNT}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.booksList}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingTop: 15,
    paddingBottom: 10,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  booksList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: ITEM_MARGIN,
  },
});
