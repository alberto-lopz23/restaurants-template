"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [verificando, setVerificando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
        setAutenticado(false);
      } else {
        setAutenticado(true);
      }
      setVerificando(false);
    });
    return () => unsub();
  }, [pathname]);

  if (verificando || !autenticado) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Verificando acceso...</p>
      </div>
    );
  }

  return <>{children}</>;
}