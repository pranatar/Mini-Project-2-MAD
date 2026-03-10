import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from "base-64";

WebBrowser.maybeCompleteAuthSession();

const USER_STORAGE_KEY = "@library_user_id";

interface AuthContextType {
  user: Doc<"users"> | null | undefined;
  userId: Id<"users"> | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveSession: (id: Id<"users">) => Promise<void>;
  isAdmin: boolean;
  isMahasiswa: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const userResult = useQuery(api.auth.getCurrentUser, userId ? { userId } : "skip");
  const getOrCreateGoogleUser = useMutation(api.auth.getOrCreateGoogleUser);

  // Combine local loading and user query loading
  const loading = localLoading || (userId !== null && userResult === undefined);
  // Ensure user is explicitly null when not logged in (to distinguish from undefined/loading)
  const user = userId ? userResult : null;

  // Platform-specific redirect URI logic
  // For Web, we need an explicit redirect URI
  // For Native (Expo Go), we let promptAsync({ useProxy: true }) handle it to avoid exp:// issues
  const webRedirectUri = AuthSession.makeRedirectUri({
    path: "google-auth",
  });

  // Google Auth config
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    // ONLY set redirectUri for web here. For native, let useProxy handle it.
    redirectUri: Platform.OS === "web" ? webRedirectUri : undefined,
    extraParams: {
      prompt: "select_account",
    },
  });

  // Log configuration for debugging
  useEffect(() => {
    console.log("--- Google Auth Debug ---");
    console.log("Platform:", Platform.OS);
    if (Platform.OS === "web") {
      console.log("Web Redirect URI:", webRedirectUri);
    } else {
      console.log("Using Expo Auth Proxy (https://auth.expo.io)");
    }
    console.log("Web Client ID:", process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.substring(0, 10) + "...");
    console.log("-------------------------");
  }, []);

  // Load saved session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedUserId = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (savedUserId) {
          setUserId(savedUserId as Id<"users">);
        }
      } catch (error) {
        console.error("Failed to load session:", error);
      } finally {
        setLocalLoading(false);
      }
    };
    loadSession();
  }, []);

  // Save session when userId changes
  useEffect(() => {
    const saveSession = async () => {
      try {
        if (userId) {
          await AsyncStorage.setItem(USER_STORAGE_KEY, userId);
        } else {
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to save session:", error);
      }
    };
    saveSession();
  }, [userId]);

  // Handle Google auth response
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    } else if (response?.type === "error") {
      console.error("Google Auth Response Error:", response.error);
      setLocalLoading(false);
    } else if (response) {
      console.log("Google Auth Response Type:", response.type);
    }
  }, [response]);

  // Handle Google sign in
  const handleGoogleSignIn = async (idToken: string) => {
    try {
      // Decode the token to get user info (in production, verify on backend)
      const userInfo = await fetchGoogleUserInfo(idToken);
      
      const createdUser = await getOrCreateGoogleUser({
        email: userInfo.email,
        name: userInfo.name,
        googleId: userInfo.sub,
        avatar: userInfo.picture,
      });

      if (createdUser) {
        setUserId(createdUser._id);
      }
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Fetch user info from Google token
  const fetchGoogleUserInfo = async (idToken: string) => {
    // Decode JWT token (base64url)
    const base64Url = idToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await promptAsync();
      if (result.type !== "success" && result.type !== "cancel") {
        console.warn("Google Auth prompt was not successful:", result.type);
      }
    } catch (error) {
      console.error("Failed to start Google auth:", error);
      throw error;
    }
  };

  // Save session manually (for manual login)
  const saveSession = async (id: Id<"users">) => {
    setUserId(id);
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log("Signing out user:", userId);
      setUserId(null);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      console.log("Sign out complete, storage cleared");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const isAdmin = user?.role === "admin";
  const isMahasiswa = user?.role === "mahasiswa";

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        loading,
        signInWithGoogle,
        signOut,
        saveSession,
        isAdmin,
        isMahasiswa,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
