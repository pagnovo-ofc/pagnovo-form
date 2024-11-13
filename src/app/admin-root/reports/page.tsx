"use client";

import { useState } from "react";
import { FaSearch, FaEye, FaFileExport } from "react-icons/fa";
import { trpc } from "@/utils/trpc";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/app/api/trpc/routers";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import * as XLSX from "xlsx"; // Import xlsx for exporting Excel files
import moment from "moment";

type TicketDetail = inferRouterOutputs<AppRouter>["admin"]["getTickets"]["data"][0];

export default function Reports() {
	const [filter, setFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(5);
	const [showExportModal, setShowExportModal] = useState(false);

	const ticketsQuery = trpc.admin.getTickets.useQuery({
		search: filter,
		limit: itemsPerPage,
		page: currentPage - 1,
	});

	const updateTicketStatus = trpc.admin.updateTicket.useMutation({
		onSuccess: () => {
			ticketsQuery.refetch();
			toast.success("Ticket status updated successfully.");
		},
		onError: () => {
			toast.error("Failed to update ticket status.");
		},
	});

	const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value);
	const openExportModal = () => setShowExportModal(true);
	const closeExportModal = () => setShowExportModal(false);
	const router = useRouter();

	const handleStatusChange = async (id: string, status: "PENDING" | "APPROVED" | "REJECTED") => {
		await updateTicketStatus.mutateAsync({ id, status });
		ticketsQuery.refetch();
	};

	const exportToXLSX = () => {
		if (!ticketsQuery.data) {
			toast.error("No data available to export.");
			return;
		}

		const ticketData = ticketsQuery.data.data.map((ticket) => ({
			...ticket,
		}));

		const worksheet = XLSX.utils.json_to_sheet(ticketData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

		// Export file
		XLSX.writeFile(workbook, "Tickets_Report.xlsx");
		toast.success("Tickets exported to XLSX successfully.");
	};

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<h1 className="text-3xl font-semibold text-gray-800 mb-6">Ticket Report</h1>

			<div className="mb-4 flex items-center justify-between">
				<div className="relative flex items-center w-full max-w-xs">
					<FaSearch className="absolute left-3 text-gray-500" />
					<input
						type="text"
						value={filter}
						onChange={handleFilterChange}
						placeholder="Search..."
						className="w-full pl-10 py-2 text-black border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
					/>
				</div>
				<button
					onClick={openExportModal}
					className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all transform hover:scale-105"
				>
					<FaFileExport className="inline mr-2" />
					Exportar
				</button>
			</div>

			{!ticketsQuery.data && (
				<div className="flex justify-center items-center">
					<svg
						className="animate-spin h-5 w-5 text-gray-500"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				</div>
			)}

			{ticketsQuery.data && (
				<>
					<div className="overflow-x-auto shadow rounded-lg border border-gray-300 bg-white text-black">
						<table className="min-w-full text-sm text-gray-700">
							<thead className="bg-gray-100 border-b">
								<tr>
									<th className="py-3 px-6 text-left font-medium">ID</th>
									<th className="py-3 px-6 text-left font-medium">Data</th>
									<th className="py-3 px-6 text-left font-medium">Nome</th>
									<th className="py-3 px-6 text-left font-medium">E-mail</th>
									<th className="py-3 px-6 text-left font-medium">Empresa</th>
									<th className="py-3 px-6 text-left font-medium">Site</th>
									<th className="py-3 px-6 text-left font-medium">Detalhes/Status</th>
								</tr>
							</thead>
							<tbody>
								{ticketsQuery.data?.data.length === 0 && (
									<tr>
										<td colSpan={6} className="text-center py-4">
											Nenhum ticket encontrado.
										</td>
									</tr>
								)}
								{ticketsQuery.data?.data.map((ticket) => (
									<tr key={ticket.id} className="hover:bg-gray-100 transition border-b">
										<td className="py-3 px-6">{ticket.custom_id}</td>
										<td className="py-3 px-6">{moment(ticket.created_at).format("DD/MM/YYYY")}</td>
										<td className="py-3 px-6">{ticket.full_name}</td>
										<td className="py-3 px-6">{ticket.email}</td>
										<td className="py-3 px-6">{ticket.trade_name}</td>
										<td className="py-3 px-6">{ticket.website}</td>
										<td className="py-3 px-6">
											<div className="flex space-x-2">
												<button
													onClick={() => router.push(`/admin-root/reports/${ticket.id}`)}
													className="px-2 py-1 text-blue-600 font-medium hover:underline transition-transform transform hover:scale-105"
												>
													<FaEye className="inline" /> Detalhes
												</button>
												<select
													value={ticket.status}
													onChange={(e) =>
														handleStatusChange(ticket.id, e.target.value as TicketDetail["status"])
													}
													className="text-sm border rounded-full px-2 focus:outline-none"
												>
													<option value="PENDING">PENDENTE</option>
													<option value="APPROVED">APROVADO</option>
													<option value="REJECTED">REJEITADO</option>
												</select>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					<div className="flex justify-center mt-6 space-x-2">
						{Array.from(
							{ length: (ticketsQuery.data?.count || 0) / itemsPerPage },
							(_, index) => index + 1
						).map((page) => (
							<button
								key={page}
								onClick={() => setCurrentPage(page)}
								className={`px-3 py-1 rounded-full transition-colors ${
									currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200"
								}`}
							>
								{page}
							</button>
						))}
					</div>
				</>
			)}

			{/* Export Modal */}
			{showExportModal && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
					<div className="bg-white text-black p-6 rounded-xl shadow-lg max-w-sm w-full transition-transform transform scale-105 duration-300">
						<h2 className="text-xl font-semibold mb-4">Export Tickets</h2>
						<button
							onClick={exportToXLSX}
							className="w-full px-4 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-all mb-2"
						>
							Exportar para XLSX
						</button>
						<button
							onClick={closeExportModal}
							className="w-full px-4 py-2 bg-gray-200 text-black rounded-full font-semibold hover:bg-gray-300 transition-all"
						>
							Cancelar
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
