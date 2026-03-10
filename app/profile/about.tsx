import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function AboutApp() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About App</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoSection}>
          <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
            <Ionicons name="book" size={60} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>MAD Library</Text>
          <Text style={[styles.version, { color: colors.textMuted }]}>Version 1.0.0 (Build 2026.03)</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Mission</Text>
          <Text style={[styles.text, { color: colors.text }]}>
            MAD Library is dedicated to making knowledge accessible to everyone. Our smart library system helps you manage your reading journey with ease and efficiency.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, marginTop: 15 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal Information</Text>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push("/profile/terms")}>
            <Text style={[styles.linkText, { color: colors.primary }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push("/profile/privacy")}>
            <Text style={[styles.linkText, { color: colors.primary }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          © 2026 MAD Library Team. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  version: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    width: "100%",
  },
  footer: {
    fontSize: 12,
    marginTop: 40,
    marginBottom: 20,
  },
});
