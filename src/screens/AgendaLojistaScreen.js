import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useApp } from "../context/AppContext";

function getWeekDates(anchorDate) {
  const base = anchorDate ? new Date(anchorDate) : new Date();
  const day = base.getDay();
  const monday = new Date(base);
  monday.setDate(base.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function formatShort(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" });
}

const STATUS_ACTIONS = {
  pendente: { next: "confirmado", label: "Confirmar" },
  confirmado: { next: "concluido", label: "Concluir" },
};

const STATUS_META = {
  pendente: { bg: colors.warningLight, text: colors.warning, label: "Pendente" },
  confirmado: { bg: colors.successLight, text: colors.success, label: "Confirmado" },
  concluido: { bg: colors.border, text: colors.textSecondary, label: "Concluído" },
  cancelado: { bg: colors.dangerLight, text: colors.danger, label: "Cancelado" },
};

export default function AgendaLojistaScreen() {
  const { appointments, updateAppointmentStatus, deleteAppointment } = useApp();
  const [mode, setMode] = useState("dia"); // "dia" | "semana"
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const visibleAppointments = useMemo(() => {
    const dates = mode === "dia" ? [selectedDate] : weekDates;
    return appointments
      .filter((a) => dates.includes(a.date) && a.status !== "cancelado")
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [appointments, mode, selectedDate, weekDates]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Agenda</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggle, mode === "dia" && styles.toggleActive]}
              onPress={() => setMode("dia")}
            >
              <Text style={[styles.toggleText, mode === "dia" && styles.toggleTextActive]}>
                Dia
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggle, mode === "semana" && styles.toggleActive]}
              onPress={() => setMode("semana")}
            >
              <Text style={[styles.toggleText, mode === "semana" && styles.toggleTextActive]}>
                Semana
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      {mode === "dia" ? (
        <View style={styles.dayNav}>
          <TouchableOpacity
            onPress={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().slice(0, 10));
            }}
          >
            <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.dayLabel}>{formatShort(selectedDate)}</Text>
          <TouchableOpacity
            onPress={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().slice(0, 10));
            }}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekRow}>
          {weekDates.map((d) => (
            <View key={d} style={styles.weekChip}>
              <Text style={styles.weekChipText}>{formatShort(d)}</Text>
            </View>
          ))}
        </ScrollView>
      )}

        <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 20 }}>
          {visibleAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={28} color={colors.textMuted} />
              <Text style={styles.emptyText}>Nenhum atendimento neste período.</Text>
            </View>
          ) : (
            visibleAppointments.map((item) => {
              const action = STATUS_ACTIONS[item.status];
              const isConcluded = item.status === "concluido";
              const showCancelButton = item.status !== "cancelado" && !isConcluded;
              const statusMeta = STATUS_META[item.status] ?? STATUS_META.pendente;
              return (
                <View key={item.id} style={styles.slotCard}>
                  <View style={styles.slotTimeCol}>
                    <Text style={styles.slotTime}>{item.time}</Text>
                    {mode === "semana" && (
                      <Text style={styles.slotDate}>{formatShort(item.date)}</Text>
                    )}
                  </View>

                  <View style={styles.slotInfo}>
                    <Text style={styles.slotPet}>{item.petName}</Text>
                    <Text style={styles.slotService}>{item.service}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusMeta.text }]}>
                        {statusMeta.label}
                      </Text>
                    </View>
                  </View>

                  {showCancelButton ? (
                    <View style={styles.actionGroup}>
                      {action && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => updateAppointmentStatus(item.id, action.next)}
                        >
                          <Text style={styles.actionButtonText}>{action.label}</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => updateAppointmentStatus(item.id, "cancelado")}
                      >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  ) : isConcluded ? (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteAppointment(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>Excluir</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "600", color: colors.textPrimary },
  toggleRow: { flexDirection: "row", gap: 6 },
  toggle: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  toggleText: { fontSize: 12, color: colors.textSecondary },
  toggleTextActive: { color: colors.primaryDark, fontWeight: "500" },
  dayNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  dayLabel: { fontSize: 14, fontWeight: "500", color: colors.textPrimary, minWidth: 100, textAlign: "center" },
  weekRow: { marginTop: 16, marginBottom: 8 },
  weekChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  weekChipText: { fontSize: 12, color: colors.textSecondary },
  emptyState: { alignItems: "center", marginTop: 40, gap: 8 },
  emptyText: { fontSize: 13, color: colors.textSecondary },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
  slotTimeCol: { width: 56 },
  slotTime: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },
  slotDate: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  slotInfo: { flex: 1 },
  slotPet: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },
  slotService: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  actionGroup: {
    alignItems: "flex-end",
    gap: 6,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionButtonText: { color: "#fff", fontSize: 11, fontWeight: "500" },
  cancelButton: {
    backgroundColor: colors.dangerLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  cancelButtonText: { color: colors.danger, fontSize: 11, fontWeight: "500" },
  deleteButton: {
    backgroundColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  deleteButtonText: { color: colors.textSecondary, fontSize: 11, fontWeight: "500" },
});
