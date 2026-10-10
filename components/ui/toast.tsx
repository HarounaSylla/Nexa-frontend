"use client";

import { Toaster, toast as sonnerToast } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      richColors
      closeButton
      offset={24}
      mobileOffset="calc(88px + env(safe-area-inset-bottom, 0px))"
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
