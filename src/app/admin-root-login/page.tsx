// app/admin/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const adminSessinon = trpc.admin.session.useQuery();

  useEffect(() => {
    if (adminSessinon.data && adminSessinon.isSuccess) {
      router.push("/admin-root/dashboard");
    }
  }, [adminSessinon.data, adminSessinon.isSuccess, router]);

  const loginAdmin = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      // Store token in localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
        adminSessinon.refetch();
        // Redirect to dashboard after successful login
        router.push("/admin-root/dashboard");
      }
    },
    onError: (error) => {
      console.error("Login error:", error.message);
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdmin.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Logo PagNovo"
            width={60}
            height={60}
            className="mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold text-gray-800">
            Login do Administrador
          </h2>
          <p className="text-gray-500">Acesse o painel de administração</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
              placeholder="example@example.com"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
              placeholder="Sua senha"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:animate-pulse"
            disabled={loginAdmin.isPending}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
