// app/admin/dashboard/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { FaCheckCircle, FaClock, FaTimesCircle, FaClipboardList } from "react-icons/fa";

export default function AdminDashboard() {
	const router = useRouter();
	const { data: dashboardData, isLoading } = trpc.admin.getDashboard.useQuery();

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
			<div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl text-center border border-gray-200">
				<h1 className="text-3xl font-semibold text-gray-800 mb-4">Bem-vindo, Administrador!</h1>
				<p className="text-gray-500 mb-6">Acompanhe o status de registros do sistema.</p>

				<div className="grid grid-cols-2 gap-4 mt-6">
					{/* Total Tickets */}
					<div className="bg-blue-50 rounded-lg p-4 shadow-inner flex flex-col items-center">
						<FaClipboardList className="text-blue-600 w-8 h-8 mb-2" />
						<h2 className="text-lg font-semibold text-gray-700">Total de Registros</h2>
						<div className="text-4xl font-bold text-blue-600 mt-2">
							{isLoading ? (
								<span className="text-gray-400 animate-pulse">...</span>
							) : (
								dashboardData?.countTickets ?? 0
							)}
						</div>
					</div>

					{/* Approved Tickets */}
					<div className="bg-green-50 rounded-lg p-4 shadow-inner flex flex-col items-center">
						<FaCheckCircle className="text-green-500 w-8 h-8 mb-2" />
						<h2 className="text-lg font-semibold text-gray-700">Aprovados</h2>
						<div className="text-4xl font-bold text-green-600 mt-2">
							{isLoading ? (
								<span className="text-gray-400 animate-pulse">...</span>
							) : (
								dashboardData?.countApprovedTickets ?? 0
							)}
						</div>
					</div>

					{/* Pending Tickets */}
					<div className="bg-yellow-50 rounded-lg p-4 shadow-inner flex flex-col items-center">
						<FaClock className="text-yellow-500 w-8 h-8 mb-2" />
						<h2 className="text-lg font-semibold text-gray-700">Pendentes</h2>
						<div className="text-4xl font-bold text-yellow-500 mt-2">
							{isLoading ? (
								<span className="text-gray-400 animate-pulse">...</span>
							) : (
								dashboardData?.countPendingTickets ?? 0
							)}
						</div>
					</div>

					{/* Rejected Tickets */}
					<div className="bg-red-50 rounded-lg p-4 shadow-inner flex flex-col items-center">
						<FaTimesCircle className="text-red-500 w-8 h-8 mb-2" />
						<h2 className="text-lg font-semibold text-gray-700">Rejeitados</h2>
						<div className="text-4xl font-bold text-red-600 mt-2">
							{isLoading ? (
								<span className="text-gray-400 animate-pulse">...</span>
							) : (
								dashboardData?.countRejectedTickets ?? 0
							)}
						</div>
					</div>
				</div>

				<button
					onClick={() => router.push("/admin-root/reports")}
					className="mt-8 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-full shadow hover:bg-blue-700 transition"
				>
					Ver Relatórios
				</button>
			</div>
		</div>
	);
}
