export function displayWhatsAppError(message: string): string {
  if (message === "whatsapp_window_closed") {
    return (
      "Le client n'a pas écrit depuis plus de 24 h : WhatsApp bloque l'envoi. " +
      "Demandez-lui de vous écrire, puis réessayez."
    );
  }
  if (message === "whatsapp_send_failed") {
    return "L'envoi WhatsApp a échoué. Réessayez dans un instant.";
  }
  if (message === "whatsapp_not_configured") {
    return "Le numéro WhatsApp de la boutique n'est pas configuré.";
  }
  return message;
}
