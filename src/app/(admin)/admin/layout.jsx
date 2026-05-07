"use client";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "⊞" },
  { label: "Menú", href: "/admin/menu", icon: "🍽" },
  { label: "Mesas", href: "/admin/mesas", icon: "🪑" },
  { label: "Pedidos", href: "/admin/pedidos", icon: "📋" },
  { label: "Reservaciones", href: "/admin/reservaciones", icon: "📅" },
  { label: "Configuración", href: "/admin/configuracion", icon: "⚙️" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-stone-100 flex">
        <aside className="w-64 bg-stone-900 min-h-screen flex flex-col fixed left-0 top-0">
          <div className="px-6 py-6 border-b border-stone-800">
            <p className="text-amber-400 text-xs uppercase tracking-widest mb-1">Admin</p>
            <h1 className="text-white font-bold text-lg">La Casa de Juan</h1>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              
              <a  key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  pathname === item.href
                    ? "bg-amber-500 text-black font-semibold"
                    : "text-stone-400 hover:bg-stone-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="px-3 py-4 border-t border-stone-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-stone-400 hover:bg-stone-800 hover:text-white transition"
            >
              <span>→</span>
              Cerrar sesión
            </button>
          </div>
        </aside>
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}