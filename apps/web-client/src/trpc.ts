import type { AppRouter } from '@repo/web-server';
import { createTRPCProxyClient, httpLink } from '@trpc/client';

// Pass AppRouter as generic here. 👇 This lets the `trpc` object know
// what procedures are available on the server and their input/output types.
export const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpLink({
            url: '/api/'
        })
    ]
});
