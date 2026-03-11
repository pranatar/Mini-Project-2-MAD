import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { useCountdown } from "@/hooks/useCountdown";

const { width } = Dimensions.get("window");

export default function AdminDashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  
  // Fetch stats from Convex
  const stats = useQuery(api.admin.getStats);
  const recentActivity = useQuery(api.admin.getRecentActivity, { limit: 5 });

  const adminActions = [
    {
      title: "Manage Users",
      icon: "people",
      color: "#8b5cf6",
      route: "/admin/users",
      description: "Manage accounts and roles",
    },
    {
      title: "Manage Books",
      icon: "book",
      color: "#10b981",
      route: "/admin/books",
      description: "Add, edit or delete books",
    },
    {
      title: "Manage Borrowings",
      icon: "swap-horizontal",
      color: "#f59e0b",
      route: "/admin/borrowings",
      description: "Confirm returns & track fines",
    },
  ];

  if (stats === undefined) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header handled by Tabs */}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Books"
            value={stats.totalBooks}
            icon="library"
            color="#3b82f6"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="people"
            color="#ec4899"
          />
          <StatCard
            title="Active Borrows"
            value={stats.activeBorrowings}
            icon="bookmark"
            color="#10b981"
          />
          <StatCard
            title="Reserved"
            value={stats.reservedBorrowings}
            icon="time"
            color="#f59e0b"
          />
          <StatCard
            title="Overdue"
            value={stats.overdueBorrowings}
            icon="warning"
            color="#ef4444"
          />
          <StatCard
            title="This Week"
            value={stats.recentBorrowings}
            icon="swap-horizontal"
            color="#8b5cf6"
          />
        </View>

        {/* Action List */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Management</Text>
        {adminActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionCard, { backgroundColor: colors.surface }]}
            onPress={() => router.push(action.route as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + "20" }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
              <Text style={[styles.actionDesc, { color: colors.textMuted }]}>{action.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        {/* Activity Overview */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Activity Overview</Text>
        {recentActivity && recentActivity.length > 0 ? (
          <View style={[styles.activityContainer, { backgroundColor: colors.surface }]}>
            {recentActivity.map((activity, index) => (
              <ActivityItem key={activity.id} activity={activity} colors={colors} isLast={index === recentActivity.length - 1} />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyActivity, { backgroundColor: colors.surface }]}>
            <Ionicons name="time-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No recent activity</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ActivityItem({ activity, colors, isLast }: any) {
  const countdown = useCountdown(activity.dueDate, 60000);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "return": return { icon: "return-up-back", color: "#10b981" };
      case "reserve": return { icon: "bookmark", color: "#f59e0b" };
      case "overdue": return { icon: "alert-circle", color: "#ef4444" };
      default: return { icon: "book", color: "#3b82f6" };
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case "return": return "returned";
      case "reserve": return "reserved";
      case "overdue": return "overdue";
      default: return "borrowed";
    }
  };

  const { icon, color } = getActivityIcon(activity.type);

  return (
    <View>
      <View style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.activityContent}>
          <Text style={[styles.activityText, { color: colors.text }]}>
            <Text style={styles.activityUser}>{activity.userName}</Text>
            {" "}{getActivityText(activity.type)}{" "}
            <Text style={styles.activityBook}>"{activity.bookTitle}"</Text>
          </Text>
          <View style={styles.activityMeta}>
            {activity.type === "overdue" && (
              <View style={[styles.overdueBadge, { backgroundColor: `${colors.danger}20` }]}>
                <Ionicons name="warning" size={12} color={colors.danger} />
                <Text style={[styles.overdueText, { color: colors.danger }]}>
                  {countdown.isOverdue ? "Overdue!" : countdown.text}
                </Text>
              </View>
            )}
            <Text style={[styles.activityTime, { color: colors.textMuted }]}>
              {new Date(activity.timestamp).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </Text>
          </View>
        </View>
      </View>
      {!isLast && <View style={[styles.activityDivider, { backgroundColor: colors.border }]} />}
    </View>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.statIconBox, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textMuted }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statTitle: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 8,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  actionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  activityContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 14,
    lineHeight: 20,
  },
  activityUser: {
    fontWeight: "600",
  },
  activityBook: {
    fontStyle: "italic",
    fontWeight: "500",
  },
  activityMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  activityTime: {
    fontSize: 12,
  },
  overdueBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  overdueText: {
    fontSize: 11,
    fontWeight: "600",
  },
  activityDivider: {
    height: 1,
    marginVertical: 4,
  },
  emptyActivity: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});
