import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useApp, PETSHOP_ADDRESS } from "../context/AppContext";
import { openPetshopWhatsapp, openPetshopMap } from "../utils/contact";

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.logoWrap}>
        <Image
          source={require("../../assets/logo_source.jpeg")}
          style={styles.logoImage}
        />
        <Text style={styles.title}>Mascotti PetShop</Text>
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

      <View style={styles.contactCard}>
        <Text style={styles.contactTitle}>Dúvidas ou informações?</Text>
        <Text style={styles.contactText}>
          Fale com a loja pelo WhatsApp a qualquer momento, sem precisar entrar no app.
        </Text>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={openPetshopMap}
        >
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.contactRowText}>{PETSHOP_ADDRESS}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={() => openPetshopWhatsapp()}
        >
          <Ionicons name="logo-whatsapp" size={16} color="#fff" />
          <Text style={styles.whatsappButtonText}>Falar no WhatsApp</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  logoWrap: { alignItems: "center", marginBottom: 32 },
  logoImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
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
  contactCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  contactTitle: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  contactText: { fontSize: 12, color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  contactRowText: { fontSize: 12, color: colors.textSecondary, flex: 1, textDecorationLine: "underline" },
  whatsappButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#25D366",
    borderRadius: 10,
    paddingVertical: 12,
  },
  whatsappButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
