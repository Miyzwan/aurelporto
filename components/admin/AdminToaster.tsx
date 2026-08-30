"use client";

import { Toaster } from "sonner";

export function AdminToaster() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      duration={4000}
      containerAriaLabel="Admin notifications"
    />
  );
}
