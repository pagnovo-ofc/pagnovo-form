"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, getFetch, loggerLink } from "@trpc/client";
import { useState } from "react";
// import superjson from "superjson";
import { trpc } from "./trpc";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const TrpcProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: { queries: { staleTime: 15000 } },
			})
	);

	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				loggerLink({
					enabled: () => true,
				}),
				httpBatchLink({
					url: "/api/trpc",
					fetch: async (input, init?) => {
						const fetch = getFetch();
						const token = localStorage.getItem("token"); // Retrieve token from localStorage

						return fetch(input, {
							...init,
							credentials: "include",
							headers: {
								...init?.headers,
								authorization: token ? `Bearer ${token}` : "", // Set token if available
							},
						});
					},
				}),
			],
			// transformer: superjson,
		})
	);
	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				{children}
				<ReactQueryDevtools />
			</QueryClientProvider>
		</trpc.Provider>
	);
};
