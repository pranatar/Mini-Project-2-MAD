import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import useTheme from "@/hooks/useTheme";

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message = "Loading..." }: LoadingViewProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
    </View>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "📚",
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.emptyContainer, { backgroundColor: colors.bg }]}>
      <Text style={styles.emptyEmoji}>{icon}</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      {message && (
        <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <View style={styles.actionButton}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </View>
      )}
    </View>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.errorContainer, { backgroundColor: colors.bg }]}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
      <Text style={[styles.errorTitle, { color: colors.text }]}>Oops!</Text>
      <Text style={[styles.errorMessage, { color: colors.textMuted }]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

import { TouchableOpacity } from "react-native";
