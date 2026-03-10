import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import useTheme from "@/hooks/useTheme";
import { LoadingView, EmptyState } from "@/components/States";

const { width } = Dimensions.get("window");

export default function MyCollections() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userId } = useAuth();
  
  const favorites = useQuery(api.favorites.getUserFavorites, userId ? { userId } : "skip");

  if (!favorites) {
    return <LoadingView message="Loading your collection..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Collections</Text>
        <View style={styles.placeholder} />
      </View>

      {favorites.length === 0 ? (
        <EmptyState
          icon="📚"
          title="Your collection is empty"
          message="Books you favorite will appear here for quick access."
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.bookCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push(`/book/${item.bookId}`)}
            >
              <Image 
                source={{ uri: item.book.coverImage }} 
                style={styles.coverImage}
                resizeMode="cover"
              />
              <View style={styles.bookInfo}>
                <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.book.title}
                </Text>
                <Text style={[styles.bookAuthor, { color: colors.textMuted }]} numberOfLines={1}>
                  {item.book.author}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 32,
  },
  listContent: {
    padding: 15,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  bookCard: {
    width: (width - 45) / 2,
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  coverImage: {
    width: "100%",
    height: 220,
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
  },
});
