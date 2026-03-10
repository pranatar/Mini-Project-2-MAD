import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";

export default function EditProfile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const updateUserProfile = useMutation(api.auth.updateUserProfile);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!user) {
      Alert.alert("Error", "User not found");
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile({
        userId: user._id,
        name,
      });
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <TouchableOpacity style={styles.changeAvatarButton}>
          <Ionicons name="camera" size={20} color={colors.primary} />
          <Text style={[styles.changeAvatarText, { color: colors.primary }]}>
            Change Photo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Email Address</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
          />
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Email cannot be changed
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Role</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons 
              name={user?.role === "admin" ? "shield-checkmark" : "person"} 
              size={20} 
              color={user?.role === "admin" ? colors.danger : colors.primary} 
            />
            <Text style={[styles.roleText, { color: colors.text }]}>
              {user?.role === "admin" ? "Administrator" : "Mahasiswa"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { 
              backgroundColor: isLoading ? colors.textMuted : colors.primary,
              opacity: isLoading ? 0.6 : 1
            }
          ]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
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
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  changeAvatarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: "600",
  },
  form: {
    paddingHorizontal: 20,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  roleText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
