import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useApp } from "../context/AppContext";

const SPECIES = ["Cachorro", "Gato", "Outro"];
const SIZES = ["Pequeno", "Médio", "Grande"];
const GENDERS = ["Macho", "Fêmea"];
const YES_NO = ["Sim", "Não"];
const BEHAVIOR_OPTIONS = ["Calmo", "Nervoso", "Bravo", "Outro"];

export default function MeusPetsScreen() {
  const { pets, addPet, removePet } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState(SPECIES[0]);
  const [speciesOther, setSpeciesOther] = useState("");
  const [breed, setBreed] = useState("");
  const [size, setSize] = useState(SIZES[0]);
  const [gender, setGender] = useState(GENDERS[0]);
  const [age, setAge] = useState("");
  const [healthIssue, setHealthIssue] = useState("Não");
  const [healthDetails, setHealthDetails] = useState("");
  const [visitsOften, setVisitsOften] = useState("Sim");
  const [behavior, setBehavior] = useState(BEHAVIOR_OPTIONS[0]);
  const [behaviorOther, setBehaviorOther] = useState("");
  const [error, setError] = useState("");

  function resetForm() {
    setName("");
    setSpecies(SPECIES[0]);
    setSpeciesOther("");
    setBreed("");
    setSize(SIZES[0]);
    setGender(GENDERS[0]);
    setAge("");
    setHealthIssue("Não");
    setHealthDetails("");
    setVisitsOften("Sim");
    setBehavior(BEHAVIOR_OPTIONS[0]);
    setBehaviorOther("");
    setError("");
  }

  function handleSave() {
    if (!name.trim()) {
      setError("Informe o nome do pet.");
      return;
    }

    const finalSpecies = species === "Outro" ? speciesOther.trim() || "Outro" : species;
    const finalBehavior = behavior === "Outro" ? behaviorOther.trim() || "Outro" : behavior;
    const finalHealthDetails = healthIssue === "Sim" ? healthDetails.trim() : "";

    addPet({
      name: name.trim(),
      species: finalSpecies,
      breed: breed.trim(),
      size,
      gender,
      age: age.trim(),
      healthIssue,
      healthDetails: finalHealthDetails,
      visitsOften,
      behavior: finalBehavior,
    });

    resetForm();
    setModalVisible(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {pets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="paw-outline" size={28} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhum pet cadastrado</Text>
            <Text style={styles.emptyText}>
              Toque em + para cadastrar seu primeiro pet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={pets}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => (
              <View style={styles.petCard}>
                <View style={styles.petIcon}>
                  <Ionicons name="paw" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.petName}>{item.name}</Text>
                  <Text style={styles.petMeta}>
                    {item.species}
                    {item.breed ? ` · ${item.breed}` : ""} · {item.size}
                  </Text>
                  <Text style={styles.petDetails}>
                    {item.gender ? `Sexo: ${item.gender}` : ""}
                    {item.age ? ` · Idade: ${item.age}` : ""}
                    {item.visitsOften ? ` · Petshop: ${item.visitsOften}` : ""}
                  </Text>
                  <Text style={styles.petDetails}>
                    {item.healthIssue ? `Saúde: ${item.healthIssue}` : ""}
                    {item.healthDetails ? ` · ${item.healthDetails}` : ""}
                    {item.behavior ? ` · Comportamento: ${item.behavior}` : ""}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removePet(item.id)}>
                  <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Novo pet</Text>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.label}>Nome do pet</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome do pet"
                value={name}
                onChangeText={setName}
              />

            <Text style={styles.label}>Espécie</Text>
            <View style={styles.chipsRow}>
              {SPECIES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, species === s && styles.chipActive]}
                  onPress={() => setSpecies(s)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      species === s && styles.chipTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {species === "Outro" && (
              <>
                <Text style={styles.label}>Qual?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: hamster, coelho, ave..."
                  value={speciesOther}
                  onChangeText={setSpeciesOther}
                />
              </>
            )}

            <Text style={styles.label}>Raça</Text>
            <TextInput
              style={styles.input}
              placeholder="Raça do pet"
              value={breed}
              onChangeText={setBreed}
            />

            <Text style={styles.label}>Porte</Text>
            <View style={styles.chipsRow}>
              {SIZES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, size === s && styles.chipActive]}
                  onPress={() => setSize(s)}
                >
                  <Text
                    style={[styles.chipText, size === s && styles.chipTextActive]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Sexo</Text>
            <View style={styles.chipsRow}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, gender === g && styles.chipActive]}
                  onPress={() => setGender(g)}
                >
                  <Text
                    style={[styles.chipText, gender === g && styles.chipTextActive]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Idade</Text>
            <TextInput
              style={styles.input}
              placeholder="Idade do pet"
              value={age}
              onChangeText={setAge}
            />

            <Text style={styles.label}>Problema de saúde?</Text>
            <View style={styles.chipsRow}>
              {YES_NO.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.chip, healthIssue === option && styles.chipActive]}
                  onPress={() => setHealthIssue(option)}
                >
                  <Text
                    style={[styles.chipText, healthIssue === option && styles.chipTextActive]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {healthIssue === "Sim" && (
              <>
                <Text style={styles.label}>Qual?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: alergia, felv, diabetes..."
                  value={healthDetails}
                  onChangeText={setHealthDetails}
                />
              </>
            )}

            <Text style={styles.label}>Vai com frequência ao petshop?</Text>
            <View style={styles.chipsRow}>
              {YES_NO.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.chip, visitsOften === option && styles.chipActive]}
                  onPress={() => setVisitsOften(option)}
                >
                  <Text
                    style={[styles.chipText, visitsOften === option && styles.chipTextActive]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Comportamento</Text>
            <View style={styles.chipsRow}>
              {BEHAVIOR_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.chip, behavior === option && styles.chipActive]}
                  onPress={() => setBehavior(option)}
                >
                  <Text
                    style={[styles.chipText, behavior === option && styles.chipTextActive]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {behavior === "Outro" && (
              <>
                <Text style={styles.label}>Descreva</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Como ele costuma se comportar?"
                  value={behaviorOther}
                  onChangeText={setBehaviorOther}
                />
              </>
            )}

              {!!error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    resetForm();
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Salvar pet</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingBottom: 90,
  },
  content: { flex: 1 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  emptyState: { alignItems: "center", marginTop: 60, gap: 6 },
  emptyTitle: { fontSize: 15, fontWeight: "500", color: colors.textPrimary },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  petIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  petName: { fontSize: 14, fontWeight: "500", color: colors.textPrimary },
  petMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  petDetails: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    maxHeight: "85%",
  },
  modalScroll: {
    maxHeight: "100%",
  },
  modalScrollContent: {
    paddingBottom: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: colors.textPrimary },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.primaryDark, fontWeight: "500" },
  error: { color: colors.danger, fontSize: 12, marginTop: 10 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  cancelButtonText: { color: colors.textSecondary, fontSize: 14 },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
