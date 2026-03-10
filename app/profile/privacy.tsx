import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "@/hooks/useTheme";

export default function PrivacyPolicy() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>1. Information Collection</Text>
        <Text style={[styles.text, { color: colors.text }]}>
          We collect information that you provide directly to us when you create an account, such as your name, email address, and profile picture.
        </Text>
        
        <Text style={[styles.title, { color: colors.text, marginTop: 24 }]}>2. Use of Information</Text>
        <Text style={[styles.text, { color: colors.text }]}>
          We use the information we collect to provide, maintain, and improve our services, including processing your borrowings and tracking your reading progress.
        </Text>

        <Text style={[styles.title, { color: colors.text, marginTop: 24 }]}>3. Data Security</Text>
        <Text style={[styles.text, { color: colors.text }]}>
          We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.
        </Text>

        <Text style={[styles.footer, { color: colors.textMuted, marginTop: 40 }]}>
          Last updated: March 10, 2026
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  placeholder: { width: 32 },
  content: { padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  text: { fontSize: 15, lineHeight: 22 },
  footer: { fontSize: 12, textAlign: "center", marginBottom: 20 }
});
