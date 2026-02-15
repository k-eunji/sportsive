// src/components/layout/Footer.tsx

"use client";

import { useState } from "react";
import ContactSheet from "./ContactSheet";

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <footer className="mt-auto border-t border-border bg-card text-muted-foreground text-sm text-center py-6 px-4 space-y-3">
        
        <div>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-foreground">
            Sportsive
          </span>. All rights reserved.
        </div>

        <button
          onClick={() => setContactOpen(true)}
          className="px-4 py-2 rounded-lg border hover:bg-muted transition"
        >
          Contact
        </button>


      </footer>

      <ContactSheet
        open={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </>
  );
}
