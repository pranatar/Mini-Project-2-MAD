import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCountdown } from "@/hooks/useCountdown";
import { Id } from "@/convex/_generated/dataModel";

interface ReservedBookCardProps {
  item: {
    _id: Id<"borrowings">;
    book: {
      _id: Id<"books">;
      title: string;
      author: string;
      coverImage: string;
      floor?: string;
      section?: string;
      shelfLocation?: string;
    };
    dueDate: number;
  };
  onPress: (bookId: Id<"books">) => void;
  onConfirmPickup: (borrowingId: Id<"borrowings">) => void;
  onCancel: (borrowingId: Id<"borrowings">) => void;
  colors: any;
}

export default function ReservedBookCard({
  item,
  onPress,
  onConfirmPickup,
  onCancel,
  colors,
}: ReservedBookCardProps) {
  const countdown = useCountdown(item.dueDate, 1000);
  const isUrgent = countdown.hours <= 24;

  return (
    <TouchableOpacity
      style={[styles.bookCard, { backgroundColor: colors.surface }]}
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
      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
          {item.book.title}
        </Text>
        <Text style={[styles.bookAuthor, { color: colors.textMuted }]} numberOfLines={1}>
          {item.book.author}
        </Text>
        {item.book.floor && item.book.section && item.book.shelfLocation && (
          <View style={styles.shelfLocationBadge}>
            <Ionicons name="location" size={12} color={colors.primary} />
            <Text style={[styles.shelfLocationText, { color: colors.text }]}>
              {item.book.floor}, {item.book.section}, Shelf {item.book.shelfLocation}
            </Text>
          </View>
        )}
        <View style={[styles.reservedBadge, { backgroundColor: isUrgent ? `${colors.danger}20` : `${colors.success}20` }]}>
          <Ionicons name="time" size={14} color={isUrgent ? colors.danger : colors.success} />
          <Text style={[styles.reservedText, { color: isUrgent ? colors.danger : colors.success }]}>
            {countdown.isOverdue ? "Overdue!" : `Pickup in ${countdown.text}`}
          </Text>
        </View>
      </View>
      <View style={styles.reservedActions}>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: colors.success }]}
          onPress={() => onConfirmPickup(item._id)}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.danger }]}
          onPress={() => onCancel(item._id)}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bookCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookCover: {
    width: 50,
    height: 70,
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
});
