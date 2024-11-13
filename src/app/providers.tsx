import { TrpcProvider } from "@/utils/trpc-provider";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
	children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
	return (
		<TrpcProvider>
			{children}
			<Toaster />
		</TrpcProvider>
	);
}
