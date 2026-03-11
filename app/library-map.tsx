import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useTheme from "@/hooks/useTheme";

const { width, height } = Dimensions.get("window");

const FACULTIES = [
  {
    id: "filsafat",
    name: "Filsafat",
    side: "left",
    icon: "headset-outline",
    color: "#6366f1",
    shelf: "A1 - A5",
  },
  {
    id: "feb",
    name: "FEB",
    side: "left",
    icon: "stats-chart-outline",
    color: "#10b981",
    shelf: "B1 - B8",
  },
  {
    id: "fkep",
    name: "FKEP",
    side: "left",
    icon: "medkit-outline",
    color: "#ef4444",
    shelf: "C1 - C6",
  },
  {
    id: "fkip",
    name: "FKIP",
    side: "left",
    icon: "school-outline",
    color: "#f59e0b",
    shelf: "D1 - D10",
  },
  {
    id: "filkom",
    name: "FILKOM",
    side: "right",
    icon: "code-slash-outline",
    color: "#3b82f6",
    shelf: "E1 - E12",
  },
  {
    id: "arsitek",
    name: "Arsitek",
    side: "right",
    icon: "business-outline",
    color: "#8b5cf6",
    shelf: "F1 - F5",
  },
  {
    id: "pertanian",
    name: "Pertanian",
    side: "right",
    icon: "leaf-outline",
    color: "#22c55e",
    shelf: "G1 - G7",
  },
  {
    id: "skripsi",
    name: "Skripsi",
    side: "right",
    icon: "document-text-outline",
    color: "#64748b",
    shelf: "H1 - H20",
  },
];

export default function LibraryMap() {
  const { colors } = useTheme();
  const router = useRouter();
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);

  const leftFaculties = FACULTIES.filter((f) => f.side === "left");
  const rightFaculties = FACULTIES.filter((f) => f.side === "right");

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Library Floor Map</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Entrance Section */}
        <View
          style={[styles.section, styles.entranceSection, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="exit-outline" size={32} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>MAIN ENTRANCE</Text>
        </View>

        {/* Lobby Section */}
        <View
          style={[styles.section, styles.lobbySection, { backgroundColor: colors.surface, borderColor: colors.primary + "40" }]}
        >
          <View style={styles.lobbyContent}>
            <Ionicons name="information-circle-outline" size={40} color={colors.primary} />
            <Text style={[styles.lobbyText, { color: colors.text }]}>CENTRAL LOBBY</Text>
            <Text style={[styles.lobbySubtext, { color: colors.textMuted }]}>Information & Help Desk</Text>
          </View>
        </View>

        {/* Corridors Container */}
        <View style={styles.corridorsContainer}>
          {/* Left Corridor */}
          <View style={styles.corridor}>
            <Text style={[styles.corridorLabel, { color: colors.textMuted }]}>WEST WING</Text>
            <View style={[styles.hallway, { backgroundColor: colors.border + "40" }]} />
            {leftFaculties.map((faculty, index) => (
              <View key={faculty.id}>
                <TouchableOpacity
                  style={[
                    styles.facultyNode,
                    { backgroundColor: colors.surface },
                    selectedFaculty?.id === faculty.id && { borderColor: faculty.color, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedFaculty(faculty)}
                >
                  <View style={[styles.iconBox, { backgroundColor: faculty.color + "20" }]}>
                    <Ionicons name={faculty.icon as any} size={24} color={faculty.color} />
                  </View>
                  <Text style={[styles.facultyName, { color: colors.text }]}>{faculty.name}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Right Corridor */}
          <View style={styles.corridor}>
            <Text style={[styles.corridorLabel, { color: colors.textMuted }]}>EAST WING</Text>
            <View style={[styles.hallway, { backgroundColor: colors.border + "40" }]} />
            {rightFaculties.map((faculty, index) => (
              <View key={faculty.id}>
                <TouchableOpacity
                  style={[
                    styles.facultyNode,
                    { backgroundColor: colors.surface },
                    selectedFaculty?.id === faculty.id && { borderColor: faculty.color, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedFaculty(faculty)}
                >
                  <View style={[styles.iconBox, { backgroundColor: faculty.color + "20" }]}>
                    <Ionicons name={faculty.icon as any} size={24} color={faculty.color} />
                  </View>
                  <Text style={[styles.facultyName, { color: colors.text }]}>{faculty.name}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Selected Info Card */}
        {selectedFaculty && (
          <View
            style={[styles.infoCard, { backgroundColor: colors.surface, borderTopColor: selectedFaculty.color }]}
          >
            <View style={styles.infoTitleRow}>
              <View style={[styles.miniIcon, { backgroundColor: selectedFaculty.color }]}>
                <Ionicons name={selectedFaculty.icon as any} size={18} color="#fff" />
              </View>
              <Text style={[styles.infoFacultyName, { color: colors.text }]}>{selectedFaculty.name} Section</Text>
            </View>
            <Text style={[styles.infoDescription, { color: colors.textMuted }]}>
              Books for the {selectedFaculty.name} faculty are located in the {selectedFaculty.side === "left" ? "West Wing" : "East Wing"}.
            </Text>
            <View style={styles.shelfInfo}>
              <Ionicons name="layers-outline" size={18} color={selectedFaculty.color} />
              <Text style={[styles.shelfText, { color: colors.text }]}>Shelves: {selectedFaculty.shelf}</Text>
            </View>
          </View>
        )}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  entranceSection: {
    borderWidth: 1,
    borderColor: "transparent",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    letterSpacing: 1,
  },
  lobbySection: {
    borderWidth: 2,
    borderStyle: "dashed",
    paddingVertical: 30,
  },
  lobbyContent: {
    alignItems: "center",
  },
  lobbyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  lobbySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  corridorsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  corridor: {
    width: "47%",
    alignItems: "center",
  },
  corridorLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    letterSpacing: 2,
  },
  hallway: {
    width: 4,
    height: "100%",
    position: "absolute",
    top: 30,
    zIndex: -1,
    borderRadius: 2,
  },
  facultyNode: {
    width: "100%",
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  facultyName: {
    fontSize: 13,
    fontWeight: "600",
  },
  infoCard: {
    marginTop: 30,
    padding: 20,
    borderRadius: 20,
    borderTopWidth: 4,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  miniIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  infoFacultyName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  shelfInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#f8fafc20",
    borderRadius: 12,
  },
  shelfText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
