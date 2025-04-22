
import { Stack } from "expo-router";
import { useFonts, Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { useEffect } from "react";
import { useFrameworkReady } from "expo-router/build/hooks";

export default function RootLayout() {
  // DO NOT REMOVE: Required for framework to function properly
  useFrameworkReady();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    // Optionally, you can do something when fonts are loaded
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}