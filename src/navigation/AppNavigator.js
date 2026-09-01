import React from "react";
import { TouchableOpacity } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import LoginScreen from "../screens/LoginScreen";
import MeusPetsScreen from "../screens/MeusPetsScreen";
import NovoAgendamentoScreen from "../screens/NovoAgendamentoScreen";
import MeusAgendamentosScreen from "../screens/MeusAgendamentosScreen";
import AgendaLojistaScreen from "../screens/AgendaLojistaScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ICONS = {
  MeusPets: "paw-outline",
  NovoAgendamento: "add-circle-outline",
  MeusAgendamentos: "calendar-outline",
};

function TutorTabs() {
  const { logout } = useApp();

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.textPrimary, fontWeight: "600" },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              logout();
              // Precisa subir pro navegador pai (Stack), pois "Login" não
              // existe entre as rotas do Tab.Navigator
              navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="MeusPets"
        component={MeusPetsScreen}
        options={{ title: "Meus pets" }}
      />
      <Tab.Screen
        name="NovoAgendamento"
        component={NovoAgendamentoScreen}
        options={{ title: "Agendar atendimento" }}
      />
      <Tab.Screen
        name="MeusAgendamentos"
        component={MeusAgendamentosScreen}
        options={{ title: "Meus agendamentos" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="TutorTabs"
        component={TutorTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AgendaLojista"
        component={AgendaLojistaScreen}
        options={{ headerShown: true, title: "Agenda do lojista" }}
      />
    </Stack.Navigator>
  );
}
