// src/components/ui/Footer.tsx
export default function Footer() {
  return (
    <footer className="relative z-10 w-full text-center text-white/70 mt-8 mb-4 text-sm">
      © {new Date().getFullYear()} 1Pila. All rights reserved.
    </footer>
  )
}
