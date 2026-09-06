import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useApp, getServiceGroup } from "../context/AppContext";
import { openWhatsapp } from "../utils/contact";

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

function formatDayMonth(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
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

// Etiqueta mostrando a categoria de agendamento do pet, pra loja já saber
// se é um atendimento "normal", com horário restrito, ou combinado por fora.
const CATEGORY_META = {
  livre: { bg: colors.successLight, text: colors.success, label: "Livre" },
  restrito: { bg: colors.warningLight, text: colors.warning, label: "Restrito" },
  contato: { bg: colors.dangerLight, text: colors.danger, label: "Contato direto" },
};

export default function AgendaLojistaScreen() {
  const { appointments, updateAppointmentStatus, deleteAppointment, pets, getPetScheduleCategory } = useApp();
  const [mode, setMode] = useState("dia"); // "dia" | "semana"
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [detailPet, setDetailPet] = useState(null);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const weekLabel = `${formatDayMonth(weekDates[0])} - ${formatDayMonth(weekDates[6])}`;

  const visibleAppointments = useMemo(() => {
    const dates = mode === "dia" ? [selectedDate] : weekDates;
    return appointments
      .filter((a) => dates.includes(a.date))
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [appointments, mode, selectedDate, weekDates]);

  function shiftDate(days) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

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
            <TouchableOpacity onPress={() => shiftDate(-1)}>
              <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.dayLabel}>{formatShort(selectedDate)}</Text>
            <TouchableOpacity onPress={() => shiftDate(1)}>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.dayNav}>
            <TouchableOpacity onPress={() => shiftDate(-7)}>
              <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.dayLabel}>{weekLabel}</Text>
            <TouchableOpacity onPress={() => shiftDate(7)}>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          style={styles.list}
          contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
        >
          {visibleAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={28} color={colors.textMuted} />
              <Text style={styles.emptyText}>Nenhum atendimento neste período.</Text>
            </View>
          ) : (
            visibleAppointments.map((item) => {
              const action = STATUS_ACTIONS[item.status];
              const isConcluded = item.status === "concluido";
              const isCancelled = item.status === "cancelado";
              const showStatusActions = !isConcluded && !isCancelled;
              const showDeleteButton = isConcluded || isCancelled;
              const statusMeta = STATUS_META[item.status] ?? STATUS_META.pendente;
              const pet = pets.find((p) => p.id === item.petId);
              const petCategory = getPetScheduleCategory(pet);
              const itemServiceGroup = getServiceGroup(item.service);
              const categoryMeta =
                itemServiceGroup === "banho_tosa" ? CATEGORY_META[petCategory] : null;

              return (
                <View key={item.id} style={styles.slotCard}>
                  <View style={styles.slotTimeCol}>
                    <Text style={styles.slotTime}>{item.time}</Text>
                    {mode === "semana" && (
                      <Text style={styles.slotDate}>{formatShort(item.date)}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.slotInfo}
                    onPress={() => setDetailPet(pet ?? null)}
                    disabled={!pet}
                  >
                    <View style={styles.slotPetRow}>
                      <Text style={styles.slotPet}>{item.petName}</Text>
                      {!!pet && (
                        <Ionicons name="information-circle-outline" size={15} color={colors.textMuted} />
                      )}
                    </View>
                    <Text style={styles.slotService}>{item.service}</Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: statusMeta.text }]}>
                          {statusMeta.label}
                        </Text>
                      </View>
                      {categoryMeta && (
                        <View style={[styles.statusBadge, { backgroundColor: categoryMeta.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: categoryMeta.text }]}>
                            {categoryMeta.label}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  {showStatusActions ? (
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
                        onPress={() =>
                          Alert.alert(
                            "Cancelar agendamento",
                            "Tem certeza que deseja cancelar esse agendamento?",
                            [
                              { text: "Voltar", style: "cancel" },
                              {
                                text: "Cancelar horário",
                                style: "destructive",
                                onPress: () => updateAppointmentStatus(item.id, "cancelado"),
                              },
                            ]
                          )
                        }
                      >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  ) : showDeleteButton ? (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        Alert.alert(
                          "Excluir agendamento",
                          "Essa ação não pode ser desfeita. Deseja excluir mesmo assim?",
                          [
                            { text: "Voltar", style: "cancel" },
                            {
                              text: "Excluir",
                              style: "destructive",
                              onPress: () => deleteAppointment(item.id),
                            },
                          ]
                        )
                      }
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

      <Modal visible={!!detailPet} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {detailPet && (
              <>
                <Text style={styles.modalTitle}>{detailPet.name}</Text>
                <Text style={styles.modalLine}>
                  {detailPet.species}
                  {detailPet.breed ? ` · ${detailPet.breed}` : ""} · {detailPet.size}
                </Text>
                <Text style={styles.modalLine}>
                  {detailPet.gender ? `Sexo: ${detailPet.gender}` : ""}
                  {detailPet.age ? ` · Idade: ${detailPet.age}` : ""}
                </Text>
                <Text style={styles.modalLine}>
                  Comportamento: {detailPet.behavior || "não informado"}
                </Text>
                <Text style={styles.modalLine}>
                  Saúde: {detailPet.healthIssue || "não informado"}
                  {detailPet.healthDetails ? ` · ${detailPet.healthDetails}` : ""}
                </Text>

                <View style={styles.modalDivider} />

                <Text style={styles.modalSectionTitle}>Tutor</Text>
                <Text style={styles.modalLine}>{detailPet.ownerName || "Não informado"}</Text>
                <Text style={styles.modalLine}>{detailPet.ownerEmail || ""}</Text>
                <Text style={styles.modalLine}>
                  WhatsApp: {detailPet.ownerWhatsapp || "não cadastrado"}
                </Text>

                <TouchableOpacity
                  style={styles.whatsappButton}
                  onPress={() =>
                    openWhatsapp(
                      detailPet.ownerWhatsapp,
                      `Olá! O serviço do seu pet ${detailPet.name} foi concluído, pode vir buscar quando quiser!`
                    )
                  }
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                  <Text style={styles.whatsappButtonText}>Avisar tutor no WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setDetailPet(null)}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  dayLabel: { fontSize: 14, fontWeight: "500", color: colors.textPrimary, minWidth: 120, textAlign: "center" },
  list: { marginTop: 12 },
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
  slotPetRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  slotPet: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },
  slotService: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  statusBadge: {
    alignSelf: "flex-start",
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
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginBottom: 6 },
  modalSectionTitle: { fontSize: 13, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  modalLine: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  modalDivider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  whatsappButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#25D366",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 16,
  },
  whatsappButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  closeButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  closeButtonText: { color: colors.textSecondary, fontSize: 13 },
});
