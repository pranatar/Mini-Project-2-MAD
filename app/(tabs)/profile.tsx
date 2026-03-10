import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { LoadingView } from "@/components/States";
import { useAuth } from "@/contexts/AuthContext";

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

const adminMenuItems = [
  {
    id: "admin-1",
    title: "User Management",
    icon: "people-outline",
    color: "#8b5cf6",
    hasArrow: true,
    route: "/admin/users" as any,
    adminOnly: true,
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
  const { user, signOut, isAdmin, loading, saveSession } = useAuth();
  const updateUserRole = useMutation(api.auth.updateUserRole);
  const [isSwitching, setIsSwitching] = React.useState(false);

  // Get user's borrowing stats
  const stats = useQuery(
    api.borrowings.getUserBorrowingStats,
    user ? { userId: user._id } : "skip"
  );

  // Show loading while auth is loading
  if (loading) {
    return <LoadingView message="Loading profile..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <LoadingView message="Please login to view profile" />
    );
  }

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
      onPress={() => {
        console.log("Bottom menu item pressed:", item.title);
        if (item.title === "Sign Out") {
          const performSignOut = async () => {
            console.log("Confirmed: Performing sign out...");
            try {
              await signOut();
              console.log("Sign out function completed.");
            } catch (err) {
              console.error("Sign out failed:", err);
            }
          };

          if (Platform.OS === "web") {
            if (window.confirm("Are you sure you want to sign out?")) {
              performSignOut();
            }
          } else {
            Alert.alert(
              "Sign Out",
              "Are you sure you want to sign out?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sign Out",
                  style: "destructive",
                  onPress: performSignOut,
                },
              ]
            );
          }
        }
      }}
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

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  // Stats might be undefined initially, use default values
  const statsData = stats || { reading: 0, finished: 0, overdue: 0, total: 0 };
  const readingCount = statsData.reading || 0;
  const finishedCount = statsData.finished || 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
        <View style={styles.headerTop}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {displayName}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textMuted }]}>
              {displayEmail}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: isAdmin ? colors.danger : colors.primary }]}>
              <Text style={styles.roleText}>
                {isAdmin ? "Admin" : "User"}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.editCircleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push("/profile/edit")}
          >
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Debug Role Switcher */}
        <TouchableOpacity 
          style={[styles.switchRoleButton, { borderColor: colors.border }]}
          disabled={isSwitching}
          onPress={async () => {
            if (!user) return;
            setIsSwitching(true);
            try {
              const newRole = isAdmin ? "mahasiswa" : "admin";
              await updateUserRole({ userId: user._id, role: newRole });
              // The useAuth hook will automatically pick up the change from Convex query
            } catch (error) {
              Alert.alert("Error", "Failed to switch role");
            } finally {
              setIsSwitching(false);
            }
          }}
        >
          <Ionicons name="swap-horizontal-outline" size={16} color={colors.primary} />
          <Text style={[styles.switchRoleText, { color: colors.primary }]}>
            {isSwitching ? "Switching..." : `Switch to ${isAdmin ? "User" : "Admin"}`}
          </Text>
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
            {statsData.total}
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

      {/* Admin Menu */}
      {isAdmin && (
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.danger }]}>
            ADMIN
          </Text>
          <FlatList
            data={adminMenuItems}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

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
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 20,
  },
  editCircleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  switchRoleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 20,
    gap: 8,
    alignSelf: "center",
  },
  switchRoleText: {
    fontSize: 13,
    fontWeight: "600",
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
