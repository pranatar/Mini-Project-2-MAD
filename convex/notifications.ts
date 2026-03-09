import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user notifications
export const getUserNotifications = query({
  args: { userId: v.id("users"), unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let notifications;

    if (args.unreadOnly) {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user_read", (q) =>
          q.eq("userId", args.userId).eq("isRead", false)
        )
        .order("desc")
        .collect();
    } else {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .collect();
    }

    return notifications.reverse();
  },
});

// Mark notification as read
export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

// Mark all notifications as read
export const markAllNotificationsAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

// Get unread count
export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    return notifications.length;
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
  },
});
