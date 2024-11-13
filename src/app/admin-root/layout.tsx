// app/admin-root/layout.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { FaChartPie, FaTable, FaSignOutAlt } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@/utils/trpc";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const adminSessinon = trpc.admin.session.useQuery();

  useEffect(() => {
    if (adminSessinon.data === null && adminSessinon.isSuccess) {
      router.push("/admin-root-login");
    }
  }, [adminSessinon.data, adminSessinon.isSuccess, router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    adminSessinon.refetch();
    router.push("/admin-root-login");
  };

  return (
    <div className="w-64">
      <div className="w-64 h-screen fixed bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center justify-center border-b border-gray-200">
          <Link
            href="/admin-root/dashboard"
            className="text-2xl font-semibold text-gray-800"
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="mr-2 inline"
            />
            <span>Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin-root/dashboard"
            className={`flex items-center px-4 py-2 rounded-lg ${
              pathname === "/admin-root/dashboard"
                ? "bg-gray-200 text-blue-600"
                : "text-gray-700"
            }`}
          >
            <FaChartPie className="mr-3" />
            Dashboard
          </Link>
          <Link
            href="/admin-root/reports"
            className={`flex items-center px-4 py-2 rounded-lg ${
              pathname === "/admin-root/reports"
                ? "bg-gray-200 text-blue-600"
                : "text-gray-700"
            }`}
          >
            <FaTable className="mr-3" />
            Relatórios
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            <FaSignOutAlt className="mr-3" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
