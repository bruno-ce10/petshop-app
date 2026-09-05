import { Alert, Linking, Platform } from "react-native";
import { PETSHOP_WHATSAPP, PETSHOP_ADDRESS } from "../context/AppContext";

export function openPetshopWhatsapp(message) {
  const phone = String(PETSHOP_WHATSAPP).replace(/\D/g, "");
  const text = encodeURIComponent(
    message || "Olá! Gostaria de tirar uma dúvida ou pedir uma informação."
  );
  const webUrl = `https://wa.me/${phone}?text=${text}`;
  const appUrl = `whatsapp://send?phone=${phone}&text=${text}`;

  if (!phone || phone.length < 10) {
    Alert.alert("Número inválido", "Confira o número de WhatsApp da loja.");
    return;
  }

  const openUrl = Platform.OS === "web"
    ? Linking.openURL(webUrl)
    : Linking.canOpenURL(appUrl).then((canOpen) =>
        Linking.openURL(canOpen ? appUrl : webUrl)
      );

  openUrl.catch(() =>
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
