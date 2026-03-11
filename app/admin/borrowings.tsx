import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { Id } from "@/convex/_generated/dataModel";

export default function ManageBorrowings() {
  const router = useRouter();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<"all" | "borrowed" | "returned" | "overdue">("all");
  const [returningId, setReturningId] = useState<Id<"borrowings"> | null>(null);

  // Queries
  const borrowings = useQuery(api.admin.getAllBorrowings) ?? [];

  // Mutations
  const confirmReturn = useMutation(api.admin.confirmReturn);

  const filteredData = borrowings.filter(b =>
    filter === "all" ? true : b.status === filter
  );

  const handleConfirmReturn = async (borrowingId: Id<"borrowings">, bookTitle: string, userName: string) => {
    console.log("🔵 Confirm Return clicked:", { borrowingId, bookTitle, userName });
    
    Alert.alert(
      "📚 Confirm Book Return",
      `Return Details:\n\n` +
      `📖 Book: ${bookTitle}\n` +
      `👤 User: ${userName}\n\n` +
      `Confirm that this book has been returned to the library?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "✅ Yes, Confirm",
          style: "default",
          onPress: async () => {
            console.log("🟢 Confirm button pressed in alert");
            setReturningId(borrowingId);
            try {
              console.log("🟡 Calling confirmReturn mutation...");
              await confirmReturn({ borrowingId });
              console.log("✅ Return successful!");
              
              // Show success notification
              Alert.alert(
                "✅ Success!",
                `Book "${bookTitle}" has been returned successfully!\n\n` +
                `✓ Book stock updated\n` +
                `✓ Borrowing record updated\n` +
                `✓ User notified`,
                [{ text: "OK" }]
              );
            } catch (err: any) {
              console.error("❌ Return error:", err);
              Alert.alert(
                "❌ Return Failed",
                `Error: ${err.message}\n\nPlease try again or contact support.`,
                [{ text: "OK" }]
              );
            } finally {
              setReturningId(null);
            }
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Filters */}
      <View style={[styles.filterWrapper, { backgroundColor: colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
          {["all", "borrowed", "overdue", "returned"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                { backgroundColor: filter === f ? colors.primary : colors.bg }
              ]}
              onPress={() => setFilter(f as any)}
            >
              <Text style={[styles.filterText, { color: filter === f ? "#fff" : colors.text }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
                <Text style={[styles.userName, { color: colors.text }]}>{item.userName}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
               <Text style={[styles.bookTitle, { color: colors.text }]}>{item.bookTitle}</Text>
               <View style={styles.dateRow}>
                 <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                 <Text style={[styles.dateText, { color: colors.textMuted }]}>
                   Due: {new Date(item.dueDate).toLocaleDateString()}
                 </Text>
               </View>
            </View>

            {item.status !== "returned" && (
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  {
                    backgroundColor: returningId === item._id ? colors.textMuted : colors.primary
                  }
                ]}
                onPress={() => handleConfirmReturn(item._id, item.bookTitle, item.userName)}
                disabled={returningId === item._id}
              >
                {returningId === item._id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                )}
                <Text style={styles.confirmButtonText}>
                  {returningId === item._id ? "Processing..." : "Confirm Return"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "borrowed": return "#3b82f6";
    case "returned": return "#10b981";
    case "overdue": return "#ef4444";
    default: return "#64748b";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterWrapper: {
    paddingBottom: 15,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 15,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  filterBar: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f080",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    padding: 20,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  cardBody: {
    marginBottom: 16,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  dateText: {
    fontSize: 13,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
