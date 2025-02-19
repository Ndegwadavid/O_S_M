"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = [
    { name: "Reception", href: "/reception", icon: "🏥" },
    { name: "Examination", href: "/examination", icon: "👁️" },
    { name: "Admin", href: "/admin", icon: "⚙️" },
    { name: "Clients", href: "/clients", icon: "👥" },
  ];

  if (!session) return null;

  return (
    <div className="w-64 bg-white/80 backdrop-blur-lg shadow-lg h-screen fixed left-0 top-0 p-4 border-r border-gray-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">OptiPlus</h2>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center p-3 rounded-lg hover:bg-blue-100 transition-colors ${
              pathname === item.href ? "bg-blue-200 text-blue-800 font-semibold" : "text-gray-700"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}