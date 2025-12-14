"use client";

import { useState } from "react";
import LoginModal from "./LoginModal";

export function LoginModalProvider({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={(e) => {
          if ((e.target as HTMLElement).dataset.loginTrigger !== undefined) {
            setOpen(true);
          }
        }}
      >
        {children}
      </div>

      <LoginModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
