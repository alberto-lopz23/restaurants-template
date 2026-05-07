"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) return;
    setCargando(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      router.push("/admin/dashboard");
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-amber-400 text-xs uppercase tracking-widest mb-2">Panel de Administración</p>
          <h1 className="text-white text-3xl font-bold">La Casa de Juan</h1>
        </div>

        {/* Card */}
        <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800">
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                Correo
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@restaurante.com"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                Contraseña
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={cargando}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-semibold rounded-xl py-3 text-sm transition mt-2"
            >
              {cargando ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}