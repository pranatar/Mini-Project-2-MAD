import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { LoadingView, EmptyState } from "@/components/States";
import { Id } from "@/convex/_generated/dataModel";

export default function Notifications() {
  const router = useRouter();
  const { colors } = useTheme();
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // Placeholder user ID - in real app, get from auth context
  const userId = "sample-user-id" as Id<"users">;

  const notifications = useQuery(
    api.notifications.getUserNotifications,
    userId ? { userId, unreadOnly: showOnlyUnread } : "skip"
  );

  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  const handleNotificationPress = async (notificationId: Id<"notifications">, isRead: boolean) => {
    if (!isRead) {
      await markAsRead({ notificationId });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (userId) {
      await markAllAsRead({ userId });
    }
  };

  const handleDelete = async (notificationId: Id<"notifications">) => {
    await deleteNotification({ notificationId });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "borrowing":
        return { name: "book-outline", color: colors.primary };
      case "return":
        return { name: "return-up-back-outline", color: colors.success };
      case "overdue":
        return { name: "alert-circle-outline", color: colors.danger };
      case "available":
        return { name: "checkmark-circle-outline", color: colors.success };
      default:
        return { name: "notifications-outline", color: colors.textMuted };
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (!notifications) {
    return <LoadingView message="Loading notifications..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.filterButton, showOnlyUnread && { backgroundColor: colors.primary }]}
            onPress={() => setShowOnlyUnread(!showOnlyUnread)}
          >
            <Ionicons
              name={showOnlyUnread ? "eye" : "eye-outline"}
              size={20}
              color={showOnlyUnread ? "#fff" : colors.text}
            />
          </TouchableOpacity>
          {(notifications || []).some((n: any) => !n.isRead) && (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Text style={[styles.markAllText, { color: colors.primary }]}>
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No notifications"
          message={showOnlyUnread ? "No unread notifications" : "You're all caught up!"}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const iconConfig = getNotificationIcon(item.type);
            return (
              <TouchableOpacity
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: colors.surface,
                    borderLeftColor: item.isRead ? "transparent" : colors.primary,
                    borderLeftWidth: item.isRead ? 0 : 4,
                  },
                ]}
                onPress={() => handleNotificationPress(item._id, item.isRead)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${iconConfig.color}20` },
                  ]}
                >
                  <Ionicons name={iconConfig.name as any} size={24} color={iconConfig.color} />
                </View>
                <View style={styles.content}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.notificationMessage, { color: colors.textMuted }]} numberOfLines={2}>
                    {item.message}
                  </Text>
                  <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item._id)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  markAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  notificationCard: {
    flexDirection: "row",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
  },
  deleteButton: {
    padding: 4,
  },
});
