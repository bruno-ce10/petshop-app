import { Alert, Linking } from "react-native";
import { PETSHOP_WHATSAPP, PETSHOP_ADDRESS } from "../context/AppContext";

export function openPetshopWhatsapp(message) {
  const text = encodeURIComponent(
    message || "Olá! Gostaria de tirar uma dúvida ou pedir uma informação."
  );
  const url = `https://wa.me/${PETSHOP_WHATSAPP}?text=${text}`;
  Linking.openURL(url).catch(() =>
    Alert.alert("Não foi possível abrir o WhatsApp", "Verifique se o app está instalado.")
  );
}

export function openPetshopMap() {
  const query = encodeURIComponent(PETSHOP_ADDRESS);
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  Linking.openURL(url).catch(() =>
    Alert.alert("Não foi possível abrir o mapa", "Tente novamente mais tarde.")
  );
}
