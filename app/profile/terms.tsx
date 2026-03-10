import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "@/hooks/useTheme";

export default function TermsOfService() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.text, { color: colors.text }]}>
          By accessing and using MAD Library, you agree to be bound by these Terms of Service and all applicable laws and regulations.
        </Text>
        
        <Text style={[styles.title, { color: colors.text, marginTop: 24 }]}>2. Use License</Text>
        <Text style={[styles.text, { color: colors.text }]}>
          Permission is granted to temporarily download one copy of the materials (information or software) on MAD Library's app for personal, non-commercial transitory viewing only.
        </Text>

        <Text style={[styles.title, { color: colors.text, marginTop: 24 }]}>3. Borrowing Rules</Text>
        <Text style={[styles.text, { color: colors.text }]}>
          Users are responsible for returning borrowed books on time. Late returns may result in temporary suspension of borrowing privileges.
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
