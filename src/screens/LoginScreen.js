import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useApp } from "../context/AppContext";

export default function LoginScreen({ navigation }) {
  const { login, registerUser } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (isRegister) {
      if (!name.trim() || !email.trim() || !password.trim() || !whatsapp.trim()) {
        setError("Campos obrigatórios: nome, e-mail, WhatsApp e senha.");
        return;
      }

      const result = registerUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        whatsapp: whatsapp.trim(),
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setError("");
      navigation.replace("TutorTabs");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Campos obrigatórios: e-mail e senha.");
      return;
    }

    const result = login({ email: email.trim(), password: password.trim() });

    if (!result.success) {
      setError(result.message);
      return;
    }

    setError("");
    navigation.replace("TutorTabs");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.logoWrap}>
        <View style={styles.logoCircle}>
          <Ionicons name="paw" size={28} color={colors.primary} />
        </View>
        <Text style={styles.title}>PetShop App</Text>
        <Text style={styles.subtitle}>
          Cadastre seu pet e marque banho, tosa ou consulta
        </Text>
      </View>

      {isRegister && (
        <>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
          />
        </>
      )}

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        placeholder="nome@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {isRegister && (
        <>
          <Text style={styles.label}>WhatsApp</Text>
          <TextInput
            style={styles.input}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
            value={whatsapp}
            onChangeText={setWhatsapp}
          />
        </>
      )}

      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Sua senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>
          {isRegister ? "Cadastrar" : "Entrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => {
          setIsRegister((prev) => !prev);
          setError("");
        }}
      >
        <Text style={styles.toggleText}>
          {isRegister ? "Já possui cadastro? Acesse aqui" : "Não tem cadastro? Cadastre-se"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("AgendaLojista")}
      >
        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.secondaryButtonText}>Ver agenda do lojista</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: "center",
  },
  logoWrap: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: "600", color: colors.textPrimary },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 20,
  },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  error: { color: colors.danger, fontSize: 12, marginTop: 10 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 22,
  },
  primaryButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  toggleButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  toggleText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "500",
  },
  secondaryButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    marginTop: 8,
  },
  secondaryButtonText: { color: colors.textSecondary, fontSize: 13 },
});
