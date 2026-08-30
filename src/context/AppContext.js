import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppContext = createContext(null);

const STORAGE_KEY = "@petshop_app_data_v1";

export const ALL_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:30", "14:30", "15:30", "16:30"];

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
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail || !cleanPassword) {
      return { success: false, message: "Campos obrigatórios: e-mail e senha." };
    }

    if (!emailPattern.test(normalizedEmail)) {
      return { success: false, message: "E-mail inválido." };
    }

    const checkUser = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === cleanPassword
    );

    if (checkUser) {
      setUser(checkUser);
      return { success: true, user: checkUser };
    }

    if (name && email && !password) {
      const legacyUser = { name: name.trim(), email: normalizedEmail };
      setUser(legacyUser);
      return { success: true, user: legacyUser };
    }

    return { success: false, message: "E-mail ou senha inválidos." };
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
  function getAvailableSlots(date) {
    const taken = appointments
      .filter((a) => a.date === date && a.status !== "cancelado")
      .map((a) => a.time);
    return ALL_SLOTS.filter((slot) => !taken.includes(slot));
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
