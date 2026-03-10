import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import useTheme from "@/hooks/useTheme";
import { LoadingView } from "@/components/States";

const { width } = Dimensions.get("window");

export default function ReadingGoals() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userId } = useAuth();
  
  const stats = useQuery(api.borrowings.getUserBorrowingStats, userId ? { userId } : "skip");

  // In a real app, these would come from the database
  const [annualGoal, setAnnualGoal] = useState(12);
  const [monthlyGoal, setMonthlyGoal] = useState(2);

  if (!stats) {
    return <LoadingView message="Loading goals..." />;
  }

  const finishedCount = stats.finished || 0;
  const annualProgress = Math.min(Math.round((finishedCount / annualGoal) * 100), 100);
  
  // Mock monthly progress for demo
  const monthlyFinished = Math.min(finishedCount, 1); 
  const monthlyProgress = Math.min(Math.round((monthlyFinished / monthlyGoal) * 100), 100);

  const handleEditGoal = (type: "Annual" | "Monthly") => {
    Alert.prompt(
      `Edit ${type} Goal`,
      "Enter the number of books you want to read:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Update", 
          onPress: (value) => {
            const num = parseInt(value || "0");
            if (num > 0) {
              if (type === "Annual") setAnnualGoal(num);
              else setMonthlyGoal(num);
            }
          }
        }
      ],
      "plain-text",
      type === "Annual" ? annualGoal.toString() : monthlyGoal.toString()
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reading Goals</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Annual Goal Card */}
        <View style={[styles.goalCard, { backgroundColor: colors.surface }]}>
          <View style={styles.goalHeader}>
            <View>
              <Text style={[styles.goalType, { color: colors.textMuted }]}>ANNUAL GOAL</Text>
              <Text style={[styles.goalTitle, { color: colors.text }]}>Read {annualGoal} books in 2024</Text>
            </View>
            <TouchableOpacity onPress={() => handleEditGoal("Annual")}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressValue, { color: colors.text }]}>{finishedCount} / {annualGoal}</Text>
              <Text style={[styles.progressText, { color: colors.textMuted }]}>{annualProgress}% completed</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { backgroundColor: colors.primary, width: `${annualProgress}%` }
                ]} 
              />
            </View>
          </View>
          
          <Text style={[styles.motivation, { color: colors.textMuted }]}>
            {finishedCount >= annualGoal 
              ? "🏆 Congratulations! You've reached your goal!" 
              : `You only need ${annualGoal - finishedCount} more books to reach your goal.`}
          </Text>
        </View>

        {/* Monthly Goal Card */}
        <View style={[styles.goalCard, { backgroundColor: colors.surface }]}>
          <View style={styles.goalHeader}>
            <View>
              <Text style={[styles.goalType, { color: colors.textMuted }]}>MONTHLY GOAL</Text>
              <Text style={[styles.goalTitle, { color: colors.text }]}>{new Date().toLocaleString('default', { month: 'long' })} Challenge</Text>
            </View>
            <TouchableOpacity onPress={() => handleEditGoal("Monthly")}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressValue, { color: colors.text }]}>{monthlyFinished} / {monthlyGoal}</Text>
              <Text style={[styles.progressText, { color: colors.textMuted }]}>{monthlyProgress}% completed</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { backgroundColor: colors.success, width: `${monthlyProgress}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Milestones Mockup */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 10 }]}>Your Milestones</Text>
        <View style={[styles.milestoneGrid]}>
          <View style={[styles.milestoneItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.milestoneIcon, { backgroundColor: finishedCount >= 1 ? '#FFD700' : colors.border }]}>
              <Ionicons name="medal" size={24} color="#fff" />
            </View>
            <Text style={[styles.milestoneLabel, { color: colors.text }]}>First Book</Text>
          </View>

          <View style={[styles.milestoneItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.milestoneIcon, { backgroundColor: finishedCount >= 5 ? '#C0C0C0' : colors.border }]}>
              <Ionicons name="ribbon" size={24} color="#fff" />
            </View>
            <Text style={[styles.milestoneLabel, { color: colors.text }]}>Reader</Text>
          </View>

          <View style={[styles.milestoneItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.milestoneIcon, { backgroundColor: finishedCount >= 10 ? '#CD7F32' : colors.border }]}>
              <Ionicons name="trophy" size={24} color="#fff" />
            </View>
            <Text style={[styles.milestoneLabel, { color: colors.text }]}>Bookworm</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
  },
  goalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  goalType: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressSection: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
  },
  progressBarBg: {
    height: 12,
    borderRadius: 6,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  motivation: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  milestoneGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  milestoneItem: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  milestoneLabel: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
});
