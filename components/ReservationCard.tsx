import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCountdown } from "@/hooks/useCountdown";
import { Id } from "@/convex/_generated/dataModel";

interface ReservationCardProps {
  item: {
    _id: Id<"borrowings">;
    book: {
      _id: Id<"books">;
      title: string;
      author: string;
      coverImage: string;
    };
    dueDate: number;
  };
  onPress: (bookId: Id<"books">) => void;
  colors: any;
}

export default function ReservationCard({ item, onPress, colors }: ReservationCardProps) {
  const countdown = useCountdown(item.dueDate, 1000);

  return (
    <TouchableOpacity
      style={[styles.reservationCard, { backgroundColor: colors.surface }]}
      onPress={() => onPress(item.book._id)}
    >
      <View style={[styles.reservationCover, { backgroundColor: colors.gradients.warning[0] }]}>
        <Text style={styles.reservationEmoji}>{item.book.coverImage}</Text>
      </View>
      <View style={styles.reservationInfo}>
        <Text style={[styles.reservationTitle, { color: colors.text }]} numberOfLines={1}>
          {item.book.title}
        </Text>
        <Text style={[styles.reservationAuthor, { color: colors.textMuted }]} numberOfLines={1}>
          {item.book.author}
        </Text>
        <View style={styles.reservationDueDateRow}>
          <Ionicons 
            name={countdown.isOverdue ? "alert-circle" : "time"} 
            size={14} 
            color={countdown.isOverdue ? colors.danger : colors.warning} 
          />
          <Text style={[styles.reservationDueDateText, { color: countdown.isOverdue ? colors.danger : colors.warning }]}>
            {countdown.isOverdue ? "Overdue!" : countdown.text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  reservationCard: {
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
  reservationCover: {
    width: 50,
    height: 70,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  reservationEmoji: {
    fontSize: 32,
  },
  reservationInfo: {
    flex: 1,
  },
  reservationTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  reservationAuthor: {
    fontSize: 12,
    marginBottom: 6,
  },
  reservationDueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reservationDueDateText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
