import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCountdown, useOverdueFine } from "@/hooks/useCountdown";
import { Id } from "@/convex/_generated/dataModel";

interface BorrowedBookCardProps {
  item: {
    _id: Id<"borrowings">;
    book: {
      _id: Id<"books">;
      title: string;
      author: string;
      coverImage: string;
    };
    dueDate: number;
    daysLeft?: number;
    currentFine?: number;
  };
  progress?: {
    percentage: number;
  } | null;
  onPress: (bookId: Id<"books">) => void;
  onReturn: (borrowingId: Id<"borrowings">) => void;
  colors: any;
}

export default function BorrowedBookCard({
  item,
  progress,
  onPress,
  onReturn,
  colors,
}: BorrowedBookCardProps) {
  const countdown = useCountdown(item.dueDate, 1000);
  const fine = useOverdueFine(item.dueDate);
  const percentage = progress?.percentage || 0;

  return (
    <TouchableOpacity
      style={[styles.bookCard, { backgroundColor: colors.surface }]}
      onPress={() => onPress(item.book._id)}
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
          <View style={styles.dueDateContainer}>
            {countdown.days <= 1 && !countdown.isOverdue && (
              <View style={[styles.warningBadge, { backgroundColor: `${colors.warning}20` }]}>
                <Text style={[styles.warningText, { color: colors.warning }]}>
                  {countdown.hours <= 1 ? "Due in 1 hour!" : "Due tomorrow"}
                </Text>
              </View>
            )}
            {countdown.isOverdue && (
              <>
                <View style={[styles.overdueBadge, { backgroundColor: `${colors.danger}20` }]}>
                  <Text style={[styles.overdueText, { color: colors.danger }]}>
                    OVERDUE
                  </Text>
                </View>
                <View style={[styles.fineBadge, { backgroundColor: `${colors.danger}20` }]}>
                  <Text style={[styles.fineText, { color: colors.danger }]}>
                    Fine: {fine.fineText}
                  </Text>
                </View>
              </>
            )}
            <Text style={[styles.dueDate, { color: countdown.isOverdue ? colors.danger : colors.textMuted }]}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onReturn(item._id)}
      >
        <Ionicons name="return-up-back-outline" size={20} color="#fff" />
      </TouchableOpacity>
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
  dueDateContainer: {
    alignItems: "flex-end",
  },
});
