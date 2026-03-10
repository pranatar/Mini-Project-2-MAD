import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingView } from "@/components/States";
import React from "react";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingView message="Loading..." />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
