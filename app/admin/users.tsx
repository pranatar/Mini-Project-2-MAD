import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Doc } from "@/convex/_generated/dataModel";

type User = Doc<"users">;

export default function AdminUsers() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user: currentUser, isAdmin } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"all" | "admin" | "mahasiswa">("all");

  // Fetch all users (admin only)
  const users = useQuery(api.auth.getAllUsers);
  const updateUserRole = useMutation(api.auth.updateUserRole);

  const handleRoleChange = (user: User, newRole: "admin" | "mahasiswa") => {
    if (user._id === currentUser?._id) {
      Alert.alert("Error", "You cannot change your own role");
      return;
    }

    Alert.alert(
      "Change Role",
      `Change ${user.name}'s role to ${newRole}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Change",
          style: "default",
          onPress: async () => {
            try {
              await updateUserRole({ userId: user._id, role: newRole });
              Alert.alert("Success", `Role updated to ${newRole}`);
            } catch {
              Alert.alert("Error", "Failed to update role");
            }
          },
        },
      ]
    );
  };

  const filteredUsers = users?.filter((user) => {
    if (selectedRole === "all") return true;
    return user.role === selectedRole;
  });

  if (!isAdmin) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.bg }]}>
        <Ionicons name="lock-closed" size={64} color={colors.danger} />
        <Text style={[styles.title, { color: colors.text }]}>Access Denied</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          You don&apos;t have permission to access this page
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!users) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>User Management</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          {users.length} total users
        </Text>
      </View>

      {/* Role Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: selectedRole === "all" ? colors.primary : colors.surface },
          ]}
          onPress={() => setSelectedRole("all")}
        >
          <Text
            style={[
              styles.filterText,
              { color: selectedRole === "all" ? "#fff" : colors.text },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: selectedRole === "admin" ? colors.danger : colors.surface },
          ]}
          onPress={() => setSelectedRole("admin")}
        >
          <Text
            style={[
              styles.filterText,
              { color: selectedRole === "admin" ? "#fff" : colors.text },
            ]}
          >
            Admin
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: selectedRole === "mahasiswa" ? colors.success : colors.surface },
          ]}
          onPress={() => setSelectedRole("mahasiswa")}
        >
          <Text
            style={[
              styles.filterText,
              { color: selectedRole === "mahasiswa" ? "#fff" : colors.text },
            ]}
          >
            Mahasiswa
          </Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onRoleChange={handleRoleChange}
            isCurrentUser={item._id === currentUser?._id}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

function UserCard({
  user,
  onRoleChange,
  isCurrentUser,
}: {
  user: User;
  onRoleChange: (user: User, role: "admin" | "mahasiswa") => void;
  isCurrentUser: boolean;
}) {
  const { colors } = useTheme();
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textMuted }]} numberOfLines={1}>
          {user.email}
        </Text>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: user.role === "admin" ? colors.danger : colors.success },
          ]}
        >
          <Text style={styles.roleText}>{user.role}</Text>
        </View>
      </View>
      {!isCurrentUser && (
        <View style={styles.actions}>
          {user.role === "mahasiswa" ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.danger }]}
              onPress={() => onRoleChange(user, "admin")}
            >
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Make Admin</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.success }]}
              onPress={() => onRoleChange(user, "mahasiswa")}
            >
              <Ionicons name="person" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Make Mahasiswa</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {isCurrentUser && (
        <View style={[styles.currentUserBadge, { backgroundColor: colors.border }]}>
          <Text style={[styles.currentUserText, { color: colors.textMuted }]}>You</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  roleText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  currentUserBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentUserText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
