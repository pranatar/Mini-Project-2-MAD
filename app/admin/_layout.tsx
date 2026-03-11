import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { TouchableOpacity, View, Image, StyleSheet } from "react-native";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => router.push("/admin/profile")} 
            style={{ marginRight: 15 }}
          >
            {user?.avatar ? (
              <View style={[styles.avatarWrapper, { borderColor: colors.primary }]}>
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              </View>
            ) : (
              <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
            )}
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerTitle: "Admin Panel",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          headerTitle: "User Management",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="books"
        options={{
          title: "Books",
          headerTitle: "Book Management",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="borrowings"
        options={{
          title: "Borrows",
          headerTitle: "Borrowing Management",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hide from bottom bar
          headerTitle: "Admin Profile",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  avatarWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
});
