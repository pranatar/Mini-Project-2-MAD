import { useRouter, useSegments, Stack } from "expo-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/hooks/useTheme";
import { LoadingView } from "@/components/States";
import React, { useEffect } from "react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

function RootLayoutContent() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log("--- Auth Route Protection ---");
    console.log("User:", user ? "Logged In" : "Logged Out");
    console.log("Loading:", loading);
    console.log("Segments:", segments);

    if (loading) return;

    const rootSegment = segments[0] || "";
    const isProtected = rootSegment === "(tabs)" || 
                        rootSegment === "profile" || 
                        rootSegment === "admin" || 
                        rootSegment === "notifications" || 
                        rootSegment === "book";

    console.log("Is Protected Route:", isProtected);

    if (!user && isProtected) {
      console.log("Redirecting to /login (Account needed)");
      router.replace("/login");
    } else if (user && rootSegment === "login") {
      console.log("Redirecting to /(tabs) (Already logged in)");
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  if (loading) {
    return <LoadingView message="Loading..." />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {!user ? (
        <Stack.Screen name="login" />
      ) : (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="book" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="profile" />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </AuthProvider>
    </ConvexProvider>
  );
}
