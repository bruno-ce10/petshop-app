import React from "react";
import { View, Image, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProvider, useApp } from "./src/context/AppContext";
import AppNavigator from "./src/navigation/AppNavigator";

function AppContent() {
  const { isLoaded } = useApp();

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require("./assets/logo_source.jpeg")}
          style={styles.loadingLogo}
        />
        <ActivityIndicator size="small" color="#0F6E56" style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7F5",
  },
  loadingLogo: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
});
