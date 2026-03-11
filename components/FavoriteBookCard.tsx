import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Id } from "@/convex/_generated/dataModel";

interface FavoriteBookCardProps {
  item: {
    book: {
      _id: Id<"books">;
      title: string;
      author: string;
      coverImage: string;
    };
  };
  onPress: (bookId: Id<"books">) => void;
  colors: any;
}

export default function FavoriteBookCard({ item, onPress, colors }: FavoriteBookCardProps) {
  return (
    <TouchableOpacity
      style={[styles.favoriteCard, { backgroundColor: colors.surface }]}
      onPress={() => onPress(item.book._id)}
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
}

const styles = StyleSheet.create({
  favoriteCard: {
    width: 100,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  bookCover: {
    width: 50,
    height: 70,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  bookEmoji: {
    fontSize: 32,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 11,
    textAlign: "center",
  },
});
