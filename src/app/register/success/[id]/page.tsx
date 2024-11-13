import Image from "next/image";
import { FaCheckCircle, FaEnvelope } from "react-icons/fa";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@/app/api/trpc/routers";
import { createContext } from "@/lib/create-context";

export default async function SuccessMessage({ params }: { params: Promise<{ id: string }> }) {
	const id = (await params).id;
	const helpers = createServerSideHelpers({
		router: appRouter,
		ctx: await createContext(),
	});
	const ticket = await helpers.ticket.getTicket.fetch({ id });

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
			<div className="max-w-md w-full p-10 bg-white text-center text-gray-800 rounded-xl shadow-md">
				<div className="flex flex-col items-center mb-6">
					<Image src="/logo.png" width={70} height={70} alt="Logo AxisBanking" className="mb-6" />
					<FaCheckCircle className="text-green-500 w-16 h-16 mb-6" />
					<h2 className="text-2xl font-semibold text-gray-900">Enviado com Sucesso!</h2>
				</div>
				<p className="text-gray-500 mb-6">
					Em breve, você receberá um e-mail com o status de criação da sua conta. Obrigado por se registrar na
					<strong className="text-gray-900"> AxisBanking</strong>.
				</p>

				<div
					className="flex items-center flex-col
                 justify-center space-x-2 text-gray-600 mb-6"
				>
					<FaEnvelope className="text-gray-500 w-5 h-5" />

					<span>Verifique sua caixa de entrada para mais informações.</span>
				</div>
				<p className="text-gray-400 font-medium">
					ID do Ticket: <span className="text-gray-600 font-semibold">{id}</span>
				</p>
				<>
					{!ticket && (
						// show loading spinner
						<div className="flex items-center justify-center mt-6">
							<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
						</div>
					)}

					{ticket && (
						<>
							{ticket.status === "PENDING" && (
								<p className="text-gray-400 font-medium">
									Status: <span className="text-yellow-500 font-semibold">Pendente</span>
								</p>
							)}

							{ticket.status === "APPROVED" && (
								<p className="text-gray-400 font-medium">
									Status: <span className="text-green-500 font-semibold">Aprovado</span>
								</p>
							)}

							{ticket.status === "REJECTED" && (
								<p className="text-gray-400 font-medium">
									Status: <span className="text-red-500 font-semibold">Rejeitado</span>
								</p>
							)}
						</>
					)}
				</>
			</div>
		</div>
	);
}
