// src/components/layout/Footer.tsx

export default function Footer() {
  
  return (
    <footer className="mt-auto border-t border-border bg-card text-muted-foreground text-sm text-center py-6 px-4">
      © {new Date().getFullYear()} <span className="font-semibold text-foreground">Sportsive</span>. All rights reserved.
    </footer>
  );
}
