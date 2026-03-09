import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { LoadingView } from "@/components/States";
import { Id } from "@/convex/_generated/dataModel";

const { width } = Dimensions.get("window");

const menuItems = [
  {
    id: "1",
    title: "Edit Profile",
    icon: "person-outline",
    color: "#3b82f6",
    hasArrow: true,
    route: "/profile/edit" as any,
  },
  {
    id: "2",
    title: "Reading Statistics",
    icon: "stats-chart-outline",
    color: "#10b981",
    hasArrow: true,
  },
  {
    id: "3",
    title: "My Collections",
    icon: "folder-outline",
    color: "#f59e0b",
    hasArrow: true,
  },
  {
    id: "4",
    title: "Reading Goals",
    icon: "flag-outline",
    color: "#ef4444",
    hasArrow: true,
  },
  {
    id: "5",
    title: "Notifications",
    icon: "notifications-outline",
    color: "#8b5cf6",
    hasArrow: true,
    hasSwitch: false,
    route: "/notifications",
  },
  {
    id: "6",
    title: "Dark Mode",
    icon: "moon-outline",
    color: "#6366f1",
    hasArrow: false,
    hasSwitch: true,
  },
];

const bottomMenuItems = [
  {
    id: "1",
    title: "Help & Support",
    icon: "help-circle-outline",
  },
  {
    id: "2",
    title: "About App",
    icon: "information-circle-outline",
  },
  {
    id: "3",
    title: "Sign Out",
    icon: "log-out-outline",
    color: "#ef4444",
  },
];

export default function Profile() {
  const router = useRouter();
  const { colors, toggleDarkMode, isDarkMode } = useTheme();

  // Placeholder user ID - in real app, get from auth context
  const userId = "sample-user-id" as Id<"users">;

  // Get user's borrowing stats
  const stats = useQuery(
    api.borrowings.getUserBorrowingStats,
    userId ? { userId } : "skip"
  );

  const readingCount = stats?.reading || 0;
  const finishedCount = stats?.finished || 0;

  const renderMenuItem = ({ item }: { item: typeof menuItems[0] }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.surface }]}
      onPress={() => {
        if (item.route) {
          router.push(item.route);
        }
      }}
    >
      <View style={[styles.menuIcon, { backgroundColor: item.color + "20" }]}>
        <Ionicons name={item.icon as any} size={22} color={item.color} />
      </View>
      <Text style={[styles.menuTitle, { color: colors.text }]}>
        {item.title}
      </Text>
      {item.hasSwitch ? (
        <Switch
          value={item.title === "Dark Mode" ? isDarkMode : false}
          onValueChange={() => {
            if (item.title === "Dark Mode") {
              toggleDarkMode();
            }
          }}
          trackColor={{ false: colors.border, true: colors.primary + "80" }}
          thumbColor={item.title === "Dark Mode" && isDarkMode ? colors.primary : "#f4f3f4"}
        />
      ) : (
        item.hasArrow && (
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        )
      )}
    </TouchableOpacity>
  );

  const renderBottomMenuItem = ({ item }: { item: typeof bottomMenuItems[0] }) => (
    <TouchableOpacity
      style={[styles.bottomMenuItem, { backgroundColor: colors.surface }]}
    >
      <Ionicons
        name={item.icon as any}
        size={22}
        color={item.color || colors.textMuted}
      />
      <Text
        style={[
          styles.bottomMenuTitle,
          { color: item.color || colors.text },
        ]}
      >
        {item.title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  if (!stats) {
    return <LoadingView message="Loading profile..." />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>
          John Doe
        </Text>
        <Text style={[styles.userEmail, { color: colors.textMuted }]}>
          john.doe@email.com
        </Text>
        <TouchableOpacity
          style={[styles.editProfileButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="book-outline" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {readingCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Reading
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {finishedCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Finished
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="star-outline" size={24} color={colors.warning} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats.total}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Total
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          ACCOUNT
        </Text>
        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Bottom Menu */}
      <View style={[styles.menuSection, styles.lastSection]}>
        <FlatList
          data={bottomMenuItems}
          renderItem={renderBottomMenuItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* App Version */}
      <Text style={[styles.version, { color: colors.textMuted }]}>
        Version 1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 15,
  },
  editProfileButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editProfileText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 15,
  },
  statCard: {
    width: (width - 50) / 3,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  lastSection: {
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 12,
  },
  bottomMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  bottomMenuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 12,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    paddingVertical: 20,
  },
});
