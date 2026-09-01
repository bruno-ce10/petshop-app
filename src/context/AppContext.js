import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppContext = createContext(null);

const STORAGE_KEY = "@petshop_app_data_v1";

// Horários gerais: a cada 30 minutos, das 9h às 17h
function buildSlots(startHour, endHour) {
  const slots = [];
  for (let h = startHour; h <= endHour; h += 1) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h < endHour) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

export const ALL_SLOTS = buildSlots(9, 17); // 09:00 ... 17:00
export const RESTRICTED_SLOTS = buildSlots(9, 11); // 09:00 ... 11:00
// Dias permitidos para pets da categoria "restrita": segunda(1), quarta(3), sexta(5)
export const RESTRICTED_WEEKDAYS = [1, 3, 5];

// Número da loja para contato direto (formato internacional, só dígitos).
// TROQUE pelo número real do WhatsApp do pet shop.
export const PETSHOP_WHATSAPP = "5551994117434";

// Endereço da loja, exibido para os usuários.
export const PETSHOP_ADDRESS = "Rua São Manoel, 1836, Porto Alegre - RS";

const initialState = {
  user: null,
  users: [],
  pets: [],
  appointments: [],
};

function sanitizeAppointments(list = []) {
  const validStatuses = ["pendente", "confirmado", "concluido", "cancelado"];

  return list.filter((item) => {
    if (!item || !item.date || !item.time) return false;
    return typeof item.status === "string" && validStatuses.includes(item.status);
  });
}

// Classifica o pet de acordo com as regras combinadas com a loja:
// - "livre": porte Pequeno + comportamento Calmo + sem problema de saúde -> qualquer horário
// - "contato": porte Grande + comportamento diferente de Calmo + com problema de saúde
//   -> agendamento precisa ser feito direto com a loja
// - "restrito": todos os outros casos -> só segunda/quarta/sexta, das 9h às 11h
export function getPetScheduleCategory(pet) {
  if (!pet) return "livre";

  const isSmallOrMedium = pet.size === "Pequeno" || pet.size === "Médio";
  const isCalm = pet.behavior === "Calmo";
  const isHealthy = pet.healthIssue !== "Sim";
  const isFreeEligible = isSmallOrMedium && isCalm && isHealthy;

  const isLarge = pet.size === "Grande";
  const isNotCalm = !!pet.behavior && pet.behavior !== "Calmo";
  const hasHealthIssue = pet.healthIssue === "Sim";
  const isFullyRestricted = isLarge && isNotCalm && hasHealthIssue;

  if (isFullyRestricted) return "contato";
  if (isFreeEligible) return "livre";
  return "restrito";
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(initialState.user);
  const [users, setUsers] = useState(initialState.users);
  const [pets, setPets] = useState(initialState.pets);
  const [appointments, setAppointments] = useState(initialState.appointments);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega dados salvos ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          const cleanedAppointments = sanitizeAppointments(data.appointments ?? []);
          setUser(data.user ?? null);
          setUsers(data.users ?? []);
          setPets(data.pets ?? []);
          setAppointments(cleanedAppointments);
        }
      } catch (e) {
        console.warn("Erro ao carregar dados salvos:", e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Persiste sempre que algo muda
  useEffect(() => {
    if (!isLoaded) return;
    const validAppointments = sanitizeAppointments(appointments);
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, users, pets, appointments: validAppointments })
    ).catch((e) => console.warn("Erro ao salvar dados:", e));
  }, [user, users, pets, appointments, isLoaded]);

  // ----- conta do tutor ----
  function registerUser({ name, email, password, whatsapp }) {
    const normalizedEmail = (email ?? "").trim().toLowerCase();
    const cleanName = (name ?? "").trim();
    const cleanPassword = (password ?? "").trim();
    const cleanWhatsapp = (whatsapp ?? "").trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const whatsappDigits = cleanWhatsapp.replace(/\D/g, "");

    if (!cleanName || !normalizedEmail || !cleanPassword || !cleanWhatsapp) {
      return { success: false, message: "Campos obrigatórios: nome, e-mail, WhatsApp e senha." };
    }

    if (!emailPattern.test(normalizedEmail)) {
      return { success: false, message: "E-mail inválido." };
    }

    if (whatsappDigits.length < 10) {
      return { success: false, message: "WhatsApp inválido." };
    }

    const exists = users.some(
      (u) => (u.email ?? "").toLowerCase() === normalizedEmail
    );

    if (exists) {
      return { success: false, message: "E-mail já cadastrado." };
    }

    const newUser = {
      id: Date.now().toString(),
      name: cleanName,
      email: normalizedEmail,
      password: cleanPassword,
      whatsapp: cleanWhatsapp,
    };

    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return { success: true, user: newUser };
  }

  function login({ name, email, password }) {
    const normalizedEmail = (email ?? "").trim().toLowerCase();
    const cleanPassword = (password ?? "").trim();

    if (!normalizedEmail || !cleanPassword) {
      return { success: false, message: "Campos obrigatórios: e-mail e senha." };
    }

    // FASE DE TESTE: não exige e-mail/senha cadastrados previamente.
    // Se já existir um usuário com esse e-mail, entra com ele (ignorando a
    // senha); senão, cria uma sessão simples só com o que foi digitado.
    // Antes de publicar de verdade, restaurar a validação de senha aqui.
    const checkUser = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (checkUser) {
      setUser(checkUser);
      return { success: true, user: checkUser };
    }

    const guestUser = {
      name: name?.trim() || normalizedEmail.split("@")[0],
      email: normalizedEmail,
    };
    setUser(guestUser);
    return { success: true, user: guestUser };
  }

  function logout() {
    setUser(null);
  }

  // ----  - pets ----
  function addPet(pet) {
    const newPet = { id: Date.now().toString(), ...pet };
    setPets((prev) => [...prev, newPet]);
    return newPet;
  }

  function removePet(petId) {
    setPets((prev) => prev.filter((p) => p.id !== petId));
  }

  // ---- agendamentos (visão do tutor) ----
  // Retorna { slots, requiresContact, reason } de acordo com a categoria do pet:
  // - reason "pet_restricoes": esse pet sempre precisa de contato direto com a loja
  // - reason "dia_invalido": categoria restrita, mas o dia escolhido não é seg/qua/sex
  // - reason "sem_disponibilidade": não sobrou nenhum horário livre nessa data
  function getAvailableSlots(date, pet) {
    const category = getPetScheduleCategory(pet);

    if (category === "contato") {
      return { slots: [], requiresContact: true, reason: "pet_restricoes" };
    }

    let baseSlots = ALL_SLOTS;

    if (category === "restrito") {
      const weekday = new Date(`${date}T00:00:00`).getDay();
      if (!RESTRICTED_WEEKDAYS.includes(weekday)) {
        return { slots: [], requiresContact: true, reason: "dia_invalido" };
      }
      baseSlots = RESTRICTED_SLOTS;
    }

    const taken = appointments
      .filter((a) => a.date === date && a.status !== "cancelado")
      .map((a) => a.time);
    const slots = baseSlots.filter((slot) => !taken.includes(slot));

    return {
      slots,
      requiresContact: slots.length === 0,
      reason: slots.length === 0 ? "sem_disponibilidade" : null,
    };
  }

  function addAppointment({ petId, petName, service, date, time }) {
    const newAppointment = {
      id: Date.now().toString(),
      petId,
      petName,
      service,
      date,
      time,
      status: "pendente",
    };
    setAppointments((prev) => [...prev, newAppointment]);
    return newAppointment;
  }

  function cancelAppointment(appointmentId) {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId ? { ...a, status: "cancelado" } : a
      )
    );
  }

  function deleteAppointment(appointmentId) {
    setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
  }

  // ----- painel do lojista ----
  function updateAppointmentStatus(appointmentId, status) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
    );
  }

  const value = {
    isLoaded,
    user,
    login,
    logout,
    pets,
    users,
    registerUser,
    addPet,
    removePet,
    appointments,
    addAppointment,
    cancelAppointment,
    deleteAppointment,
    updateAppointmentStatus,
    getAvailableSlots,
    getPetScheduleCategory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
