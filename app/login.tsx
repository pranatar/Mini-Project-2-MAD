import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import useTheme from "@/hooks/useTheme";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signInWithGoogle, saveSession } = useAuth();
  const getOrCreateGoogleUser = useMutation(api.auth.getOrCreateGoogleUser);

  // Auto redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !name) {
      Alert.alert("Error", "Please fill in both email and name");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const createdUser = await getOrCreateGoogleUser({
        email: email.toLowerCase(),
        name,
        googleId: `manual-${email.toLowerCase()}-${Date.now()}`,
      });
      
      if (createdUser) {
        await saveSession(createdUser._id);
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("Manual login error:", error);
      Alert.alert("Error", error?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Redirection is handled by the useEffect above once user is populated
    } catch (error: any) {
      Alert.alert(
        "Google Login Error",
        error?.message || "Failed to login with Google"
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="library" size={48} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Digital Library
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Your gateway to knowledge
          </Text>
        </View>

        {/* Google Login Button */}
        <TouchableOpacity
          style={[
            styles.googleButton,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}
          onPress={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
              <Text style={[styles.googleButtonText, { color: colors.text }]}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Manual Login Form */}
        <View style={styles.formContainer}>
          <Text style={[styles.formTitle, { color: colors.text }]}>
            Create Account
          </Text>
          <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>
            Enter your email and name
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Email address"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Full name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TouchableOpacity
            style={[
              styles.loginButton,
              { 
                backgroundColor: isLoading ? colors.textMuted : colors.primary,
                opacity: isLoading ? 0.6 : 1
              }
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loginButtonText}>Creating account...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Get Started</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Button */}
          <TouchableOpacity
            style={styles.quickLoginButton}
            onPress={() => {
              setEmail("student@university.edu");
              setName("Student User");
            }}
          >
            <Ionicons name="flash" size={18} color={colors.primary} />
            <Text style={[styles.quickLoginText, { color: colors.textMuted }]}>
              Quick Demo Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Secure login powered by Convex
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 20,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
  },
  formContainer: {
    marginTop: 10,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    fontSize: 15,
  },
  loginButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quickLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 12,
    gap: 6,
  },
  quickLoginText: {
    fontSize: 14,
  },
  footer: {
    alignItems: "center",
    paddingTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 12,
  },
});
