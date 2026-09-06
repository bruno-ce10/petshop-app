import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useApp } from "../context/AppContext";

const STATUS_STYLES = {
  pendente: { bg: colors.warningLight, text: colors.warning, label: "Pendente" },
  confirmado: { bg: colors.successLight, text: colors.success, label: "Confirmado" },
  concluido: { bg: colors.border, text: colors.textSecondary, label: "Concluído" },
  cancelado: { bg: colors.dangerLight, text: colors.danger, label: "Cancelado" },
};

export default function MeusAgendamentosScreen() {
  const { appointments, cancelAppointment, deleteAppointment } = useApp();

  function formatDateBR(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return dateString;
    return `${day}/${month}/${year}`;
  }

  const sorted = [...appointments].sort((a, b) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
  );

  function handleCancel(id) {
    Alert.alert(
      "Cancelar agendamento",
      "Tem certeza que deseja cancelar esse agendamento?",
      [
        { text: "Voltar", style: "cancel" },
        { text: "Cancelar horário", style: "destructive", onPress: () => cancelAppointment(id) },
      ]
    );
  }

  function handleDelete(id) {
    Alert.alert(
      "Excluir agendamento",
      "Essa ação não pode ser desfeita. Deseja excluir mesmo assim?",
      [
        { text: "Voltar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => deleteAppointment(id) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {sorted.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={28} color={colors.textMuted} />
          <Text style={styles.emptyText}>Você ainda não tem agendamentos.</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({ item }) => {
            const status = typeof item.status === "string" ? item.status.trim().toLowerCase() : "";
            const normalizedStatus = status.includes("concl") ? "concluido" : status.includes("cancel") ? "cancelado" : status;
            const statusStyle = STATUS_STYLES[normalizedStatus] ?? STATUS_STYLES.pendente;
            const canCancel = !["cancelado", "concluido"].includes(normalizedStatus) && normalizedStatus !== "";
            const isRemovable = ["concluido", "cancelado", ""].includes(normalizedStatus);

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.petName}>{item.petName}</Text>
                  <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                      {statusStyle.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.serviceText}>{item.service}</Text>

                <Text style={styles.dateText}>
                  <Ionicons name="calendar" size={12} /> {formatDateBR(item.date)} • {item.time}
                </Text>

                {canCancel ? (
                  <TouchableOpacity onPress={() => handleCancel(item.id)}>
                    <Text style={styles.cancelLink}>Cancelar</Text>
                  </TouchableOpacity>
                ) : isRemovable ? (
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteLink}>Excluir</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  emptyState: { alignItems: "center", marginTop: 60, gap: 8 },
  emptyText: { fontSize: 15, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    flexWrap: "wrap",
  },
  petName: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, flexShrink: 1, flexGrow: 1 },
  serviceText: { fontSize: 15, color: colors.textSecondary, marginTop: 6 },
  badge: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 6, flexShrink: 0 },
  badgeText: { fontSize: 12, fontWeight: "500" },
  dateText: { fontSize: 14, color: colors.textSecondary, marginTop: 6 },
  cancelLink: { fontSize: 14, color: colors.danger, marginTop: 8, fontWeight: "500" },
  deleteLink: { fontSize: 14, color: colors.textSecondary, marginTop: 8, fontWeight: "500" },
});
