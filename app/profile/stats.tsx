import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import useTheme from "@/hooks/useTheme";
import { LoadingView } from "@/components/States";

const { width } = Dimensions.get("window");

export default function ReadingStats() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userId } = useAuth();
  
  const stats = useQuery(api.borrowings.getUserBorrowingStats, userId ? { userId } : "skip");
  const readingProgress = useQuery(api.readingProgress.getUserReadingProgress, userId ? { userId } : "skip");

  if (!stats || !readingProgress) {
    return <LoadingView message="Loading statistics..." />;
  }

  const activeReading = readingProgress.length;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reading Statistics</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Overview Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="library" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Books</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="book" size={24} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.reading}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Reading</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.success}20` }]}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.finished}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Finished</Text>
          </View>
        </View>

        {/* Reading Progress Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Reading Progress</Text>
        {readingProgress.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No active reading progress found.</Text>
          </View>
        ) : (
          readingProgress.map((item) => (
            <View key={item._id} style={[styles.progressCard, { backgroundColor: colors.surface }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.book.title}
                </Text>
                <Text style={[styles.progressPercent, { color: colors.primary }]}>
                  {item.percentage}%
                </Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { backgroundColor: colors.primary, width: `${item.percentage}%` }
                  ]} 
                />
              </View>
              <Text style={[styles.pageInfo, { color: colors.textMuted }]}>
                Page {item.currentPage} of {item.totalPages}
              </Text>
            </View>
          ))
        )}

        {/* Monthly Summary Mockup */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Activity Overview</Text>
        <View style={[styles.activityCard, { backgroundColor: colors.surface }]}>
          <View style={styles.activityRow}>
            <Text style={[styles.activityLabel, { color: colors.text }]}>Books Borrowed this Month</Text>
            <Text style={[styles.activityValue, { color: colors.primary }]}>4</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.activityRow}>
            <Text style={[styles.activityLabel, { color: colors.text }]}>Reading Streak</Text>
            <Text style={[styles.activityValue, { color: colors.warning }]}>5 Days</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.activityRow}>
            <Text style={[styles.activityLabel, { color: colors.text }]}>Pages Read this Week</Text>
            <Text style={[styles.activityValue, { color: colors.success }]}>124</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: (width - 60) / 3,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  emptyCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  progressCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "bold",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  pageInfo: {
    fontSize: 12,
  },
  activityCard: {
    borderRadius: 16,
    padding: 16,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  activityLabel: {
    fontSize: 14,
  },
  activityValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    width: "100%",
  },
});
