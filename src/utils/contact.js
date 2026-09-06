import { Alert, Linking } from "react-native";
import { PETSHOP_WHATSAPP, PETSHOP_ADDRESS } from "../context/AppContext";

// Abre o WhatsApp para QUALQUER número (loja, tutor, etc.). Aceita o número
// digitado de qualquer jeito (com parênteses, traço, espaço) e adiciona o
// código do Brasil (55) se ainda não tiver.
export function openWhatsapp(rawNumber, message) {
  const digits = (rawNumber || "").replace(/\D/g, "");

  if (!digits) {
    Alert.alert("Sem WhatsApp cadastrado", "Esse tutor não tem um número de WhatsApp registrado.");
    return;
  }

  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  const text = encodeURIComponent(message || "Olá!");
  const url = `https://wa.me/${withCountryCode}?text=${text}`;
  Linking.openURL(url).catch(() =>
    Alert.alert("Não foi possível abrir o WhatsApp", "Verifique se o app está instalado.")
  );
}

export function openPetshopWhatsapp(message) {
  openWhatsapp(PETSHOP_WHATSAPP, message);
}

export function openPetshopMap() {
  const query = encodeURIComponent(PETSHOP_ADDRESS);
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  Linking.openURL(url).catch(() =>
    Alert.alert("Não foi possível abrir o mapa", "Tente novamente mais tarde.")
  );
}
