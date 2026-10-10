"use client";

import { Toaster, toast as sonnerToast } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      offset={16}
      toastOptions={{
        className: "font-sans text-sm",
      }}
    />
  );
}

export const toast = {
  success(message: string) {
    sonnerToast.success(message);
  },
  error(message: string) {
    sonnerToast.error(message);
  },
  message(message: string) {
    sonnerToast(message);
  },
};
