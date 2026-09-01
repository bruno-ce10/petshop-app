import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { openPetshopWhatsapp } from "../utils/contact";

const SERVICES = ["Banho", "Tosa", "Consulta"];

const CATEGORY_INFO = {
  restrito: {
    label: "Horário restrito",
    message:
      "Esse pet tem horários específicos: segundas, quartas e sextas, das 9h às 11h.",
  },
  contato: {
    label: "Contato direto com a loja",
    message:
      "Pelo porte, comportamento e problema de saúde informados, o agendamento desse pet precisa ser combinado direto com a loja.",
  },
};

const REASON_MESSAGES = {
  pet_restricoes:
    "Esse pet precisa de agendamento combinado direto com a loja. Toque no botão abaixo para falar no WhatsApp.",
  dia_invalido:
    "Esse pet só agenda às segundas, quartas e sextas. Escolha um desses dias ou fale direto com a loja.",
  sem_disponibilidade:
    "Não há horários livres nessa data. Fale com a loja para verificar outra opção.",
};

export default function NovoAgendamentoScreen({ navigation }) {
  const { pets, addAppointment, getAvailableSlots, getPetScheduleCategory } = useApp();
  const [petId, setPetId] = useState(pets[0]?.id ?? null);
  const [selectedServices, setSelectedServices] = useState(["Banho"]);
  const [date, setDate] = useState("");
  const [dateIso, setDateIso] = useState("");
  const [dateObject, setDateObject] = useState(new Date());
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(null);
  const [error, setError] = useState("");

  const selectedPet = useMemo(
    () => pets.find((p) => p.id === petId) ?? null,
    [pets, petId]
  );
  const category = useMemo(
    () => getPetScheduleCategory(selectedPet),
    [selectedPet, getPetScheduleCategory]
  );
  const requiresContactAlways = category === "contato";

  const slotResult = useMemo(() => {
    if (!dateIso || !selectedPet) return { slots: [], requiresContact: false, reason: null };
    return getAvailableSlots(dateIso, selectedPet);
  }, [dateIso, selectedPet, getAvailableSlots]);

  const calendarDays = useMemo(() => {
    const monthStart = new Date(
      pickerMonth.getFullYear(),
      pickerMonth.getMonth(),
      1
    );
    const startDayIndex = (monthStart.getDay() + 6) % 7;
    const totalDaysInMonth = new Date(
      pickerMonth.getFullYear(),
      pickerMonth.getMonth() + 1,
      0
    ).getDate();
    const totalDaysInPreviousMonth = new Date(
      pickerMonth.getFullYear(),
      pickerMonth.getMonth(),
      0
    ).getDate();
    const cells = [];

    for (let i = 0; i < 42; i += 1) {
      const dayNumber = i - startDayIndex + 1;
      const monthOffset = dayNumber <= 0 ? -1 : dayNumber > totalDaysInMonth ? 1 : 0;
      const targetMonth = monthOffset === 0 ? pickerMonth.getMonth() : pickerMonth.getMonth() + monthOffset;
      const targetYear = monthOffset === 0 ? pickerMonth.getFullYear() : new Date(pickerMonth.getFullYear(), targetMonth, 1).getFullYear();
      const finalDay =
        monthOffset === 0
          ? dayNumber
          : monthOffset < 0
            ? totalDaysInPreviousMonth + dayNumber
            : dayNumber - totalDaysInMonth;

      const dateValue = new Date(targetYear, targetMonth, finalDay);
      cells.push({
        key: `${targetYear}-${targetMonth}-${finalDay}`,
        value: dateValue,
        isCurrentMonth: monthOffset === 0,
      });
    }

    return cells;
  }, [pickerMonth]);

  function formatDateToBR(dateValue) {
    const dateToFormat = new Date(dateValue);
    const day = String(dateToFormat.getDate()).padStart(2, "0");
    const month = String(dateToFormat.getMonth() + 1).padStart(2, "0");
    const year = dateToFormat.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatDateToISO(dateValue) {
    const dateToFormat = new Date(dateValue);
    const year = dateToFormat.getFullYear();
    const month = String(dateToFormat.getMonth() + 1).padStart(2, "0");
    const day = String(dateToFormat.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function onDateChange(_, selectedDate) {
    const currentDate = selectedDate ?? dateObject;
    setShowDatePicker(false);
    applySelectedDate(currentDate);
  }

  function applySelectedDate(currentDate) {
    setShowDatePicker(false);
    setDateObject(currentDate);
    const formattedDate = formatDateToBR(currentDate);
    const isoDate = formatDateToISO(currentDate);
    setDate(formattedDate);
    setDateIso(isoDate);
    setTime(null);
  }

  function handleWebDateSelect(dayDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dayDate < today) return;
    applySelectedDate(dayDate);
  }

  function toggleService(serviceName) {
    setSelectedServices((prev) => {
      if (prev.includes(serviceName)) {
        const next = prev.filter((item) => item !== serviceName);
        return next.length > 0 ? next : [serviceName];
      }
      return [...prev, serviceName];
    });
  }

  function handleConfirm() {
    if (pets.length === 0) {
      setError("Cadastre um pet antes de agendar.");
      return;
    }
    if (requiresContactAlways) {
      setError("Esse pet precisa de agendamento direto com a loja.");
      return;
    }
    if (!petId || selectedServices.length === 0 || !date.trim() || !time) {
      setError("Selecione pet, serviço, data e horário para continuar.");
      return;
    }
    const isoDate = dateIso || formatDateToISO(dateObject);
    const serviceLabel = selectedServices.join(" + ");

    addAppointment({
      petId,
      petName: selectedPet?.name ?? "",
      service: serviceLabel,
      date: isoDate,
      time,
    });
    setError("");
    setTime(null);
    Alert.alert("Agendamento realizado", "Seu horário foi reservado com sucesso.");
    navigation.navigate("MeusAgendamentos");
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.label}>Pet</Text>
        {pets.length === 0 ? (
          <Text style={styles.warning}>
            Você ainda não tem pets cadastrados. Cadastre um na aba "Meus pets".
          </Text>
        ) : (
          <View style={styles.chipsRow}>
            {pets.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.chip, petId === p.id && styles.chipActive]}
                onPress={() => {
                  setPetId(p.id);
                  setTime(null);
                }}
              >
                <Text
                  style={[styles.chipText, petId === p.id && styles.chipTextActive]}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedPet && CATEGORY_INFO[category] && (
          <View
            style={[
              styles.categoryBanner,
              category === "contato" ? styles.categoryBannerDanger : styles.categoryBannerWarning,
            ]}
          >
            <Text style={styles.categoryBannerTitle}>{CATEGORY_INFO[category].label}</Text>
            <Text style={styles.categoryBannerText}>{CATEGORY_INFO[category].message}</Text>
          </View>
        )}

        {requiresContactAlways ? (
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={() =>
              openPetshopWhatsapp(
                `Olá! Quero agendar um horário para o pet ${selectedPet?.name ?? ""}.`
              )
            }
          >
            <Text style={styles.whatsappButtonText}>Falar com a loja no WhatsApp</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.label}>Serviço</Text>
            <View style={styles.chipsRow}>
              {SERVICES.map((s) => {
                const isSelected = selectedServices.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => toggleService(s)}
                  >
                    <Text
                      style={[styles.chipText, isSelected && styles.chipTextActive]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Data</Text>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.inputText, !date && styles.inputPlaceholder]}>
                {date || "Selecione a data"}
              </Text>
            </TouchableOpacity>

            {showDatePicker &&
              (Platform.OS === "web" ? (
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity
                      onPress={() =>
                        setPickerMonth(
                          new Date(
                            pickerMonth.getFullYear(),
                            pickerMonth.getMonth() - 1,
                            1
                          )
                        )
                      }
                    >
                      <Text style={styles.calendarNav}>◀</Text>
                    </TouchableOpacity>

                    <Text style={styles.calendarTitle}>
                      {pickerMonth.toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        setPickerMonth(
                          new Date(
                            pickerMonth.getFullYear(),
                            pickerMonth.getMonth() + 1,
                            1
                          )
                        )
                      }
                    >
                      <Text style={styles.calendarNav}>▶</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.weekRow}>
                    {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((day) => (
                      <Text key={day} style={styles.weekDay}>{day}</Text>
                    ))}
                  </View>

                  <View style={styles.calendarGrid}>
                    {calendarDays.map((item) => {
                      const isSelected =
                        item.isCurrentMonth &&
                        item.value.toDateString() === dateObject.toDateString();
                      const isPast = item.value < new Date(new Date().setHours(0,0,0,0));

                      return (
                        <TouchableOpacity
                          key={item.key}
                          style={[
                            styles.dayCell,
                            !item.isCurrentMonth && styles.dayCellMuted,
                            isSelected && styles.dayCellSelected,
                            isPast && item.isCurrentMonth && styles.dayCellDisabled,
                          ]}
                          onPress={() => handleWebDateSelect(item.value)}
                          disabled={isPast || !item.isCurrentMonth}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              isSelected && styles.dayTextSelected,
                              isPast && item.isCurrentMonth && styles.dayTextDisabled,
                            ]}
                          >
                            {item.value.getDate()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <DateTimePicker
                  value={dateObject}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  minimumDate={new Date()}
                  onChange={onDateChange}
                />
              ))}

            <Text style={styles.label}>Horários disponíveis</Text>
            {!dateIso ? (
              <Text style={styles.hint}>Informe uma data para ver os horários.</Text>
            ) : slotResult.requiresContact ? (
              <View>
                <Text style={styles.hint}>{REASON_MESSAGES[slotResult.reason]}</Text>
                <TouchableOpacity
                  style={styles.whatsappButtonSmall}
                  onPress={() =>
                    openPetshopWhatsapp(
                      `Olá! Não encontrei horário disponível no app para o pet ${selectedPet?.name ?? ""} em ${date}. Poderia me ajudar?`
                    )
                  }
                >
                  <Text style={styles.whatsappButtonSmallText}>Falar com a loja no WhatsApp</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.chipsRow}>
                {slotResult.slots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slot, time === slot && styles.slotActive]}
                    onPress={() => setTime(slot)}
                  >
                    <Text
                      style={[styles.slotText, time === slot && styles.slotTextActive]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!!error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirmar agendamento</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
  hint: { fontSize: 12, color: colors.textMuted },
  warning: { fontSize: 12, color: colors.warning },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.primaryDark, fontWeight: "500" },
  categoryBanner: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginTop: 14,
  },
  categoryBannerWarning: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
  },
  categoryBannerDanger: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  categoryBannerTitle: { fontSize: 12, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  categoryBannerText: { fontSize: 12, color: colors.textSecondary },
  whatsappButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  whatsappButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  whatsappButtonSmall: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },
  whatsappButtonSmallText: { color: colors.primaryDark, fontSize: 12, fontWeight: "600" },
  slot: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  slotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { fontSize: 12, color: colors.textSecondary },
  slotTextActive: { color: "#fff", fontWeight: "500" },
  inputButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
  },
  inputText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  inputPlaceholder: {
    color: colors.textMuted,
  },
  calendarContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  calendarNav: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: "700",
  },
  calendarTitle: {
    fontSize: 14,
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekDay: {
    width: "14%",
    textAlign: "center",
    fontSize: 10,
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayCell: {
    width: "14%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 6,
  },
  dayCellMuted: {
    opacity: 0.35,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellDisabled: {
    backgroundColor: colors.background,
    opacity: 0.4,
  },
  dayText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  dayTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  dayTextDisabled: {
    color: colors.textMuted,
  },
  error: { color: colors.danger, fontSize: 12, marginTop: 14 },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  confirmButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
