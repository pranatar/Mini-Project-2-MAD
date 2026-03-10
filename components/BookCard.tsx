import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useTheme from "@/hooks/useTheme";
import { Doc } from "@/convex/_generated/dataModel";

type Book = Doc<"books">;

interface BookCardProps {
  book: Book;
  onPress?: () => void;
  variant?: "default" | "compact" | "horizontal";
  showRating?: boolean;
  showAvailability?: boolean;
}

export default function BookCard({
  book,
  onPress,
  variant = "default",
  showRating = true,
  showAvailability = false,
}: BookCardProps) {
  const { colors } = useTheme();

  if (variant === "horizontal") {
    return (
      <TouchableOpacity
        style={[styles.horizontalCard, { backgroundColor: colors.surface }]}
        onPress={onPress}
      >
        <View
          style={[
            styles.horizontalCover,
            { backgroundColor: colors.gradients.primary[0] },
          ]}
        >
          <Text style={styles.coverEmoji}>{book.coverImage}</Text>
        </View>
        <View style={styles.horizontalInfo}>
          <Text style={[styles.horizontalTitle, { color: colors.text }]} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={[styles.horizontalAuthor, { color: colors.textMuted }]} numberOfLines={1}>
            {book.author}
          </Text>
          <View style={styles.horizontalMeta}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.border }]}>
              <Text style={[styles.categoryText, { color: colors.textMuted }]}>
                {book.category}
              </Text>
            </View>
            {showRating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={[styles.ratingText, { color: colors.text }]}>
                  {book.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }

  if (variant === "compact") {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: colors.surface }]}
        onPress={onPress}
      >
        <View
          style={[
            styles.compactCover,
            { backgroundColor: colors.gradients.primary[0] },
          ]}
        >
          <Text style={styles.compactCoverEmoji}>{book.coverImage}</Text>
        </View>
        <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={1}>
          {book.title}
        </Text>
        <Text style={[styles.compactAuthor, { color: colors.textMuted }]} numberOfLines={1}>
          {book.author}
        </Text>
      </TouchableOpacity>
    );
  }

  // Default vertical card
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <View
        style={[
          styles.cover,
          { backgroundColor: colors.gradients.primary[0] },
        ]}
      >
        <Text style={styles.coverEmoji}>{book.coverImage}</Text>
        {showRating && (
          <View style={[styles.ratingBadge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
            <Ionicons name="star" size={10} color="#fbbf24" />
            <Text style={styles.ratingText}>{book.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.author, { color: colors.textMuted }]} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.border }]}>
            <Text style={[styles.categoryText, { color: colors.textMuted }]}>
              {book.category}
            </Text>
          </View>
          {showAvailability && (
            <Text
              style={[
                styles.availability,
                {
                  color:
                    (book.availableCopies ?? 0) > 0 ? colors.success : colors.danger,
                },
              ]}
            >
              {(book.availableCopies ?? 0) > 0
                ? `${book.availableCopies} available`
                : "Unavailable"}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Default vertical card
  card: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cover: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  coverEmoji: {
    fontSize: 50,
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 2,
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "500",
  },
  availability: {
    fontSize: 11,
    fontWeight: "600",
  },
  // Compact card (for grid)
  compactCard: {
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  compactCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  compactCoverEmoji: {
    fontSize: 28,
  },
  compactTitle: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  compactAuthor: {
    fontSize: 11,
    textAlign: "center",
  },
  // Horizontal card
  horizontalCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  horizontalCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  horizontalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  horizontalTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  horizontalAuthor: {
    fontSize: 13,
    marginBottom: 8,
  },
  horizontalMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
