import fastifyCookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import { userService } from '@repo/services/user';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { fastify } from 'fastify';
import path from 'path';
import { z } from 'zod';
import { createContext, publicProcedure, router } from './trpc.js';

declare module 'fastify' {
    interface FastifyRequest {}
    interface Session {}
}

const appRouter = router({
    healthcheck: publicProcedure.query(() => {
        return 'OK';
    }),
    user: router({
        getUserById: publicProcedure
            .input(
                z.object({
                    id: z.number()
                })
            )
            .query(async ({ input: { id } }) => {
                return userService.getUserById(id);
            })
    })
});

export type AppRouter = typeof appRouter;

function registerServer() {
    const server = fastify({
        maxParamLength: 5000
    });

    server.register(fastifyCookie);

    if (process.env.NODE_ENV !== 'development') {
        server.register(fastifyStatic, {
            prefix: '/',
            root: path.join(process.cwd(), 'public'),
            extensions: [
                'html',
                'js',
                'css',
                'ico',
                'png',
                'jpg',
                'jpeg',
                'svg',
                'gif',
                'woff',
                'woff2',
                'ttf',
                'eot',
                'otf'
            ]
        });

        server.setNotFoundHandler((request, reply) => {
            reply.sendFile('index.html');
        });
    }

    server.register(fastifyTRPCPlugin, {
        prefix: '/api',
        trpcOptions: {
            router: appRouter,
            createContext
        }
    });

    return server;
}

async function main() {
    try {
        const server = registerServer();
        const address = await server.listen({
            host: process.env.SERVER_LISTEN_HOST,
            port: Number(process.env.SERVER_LISTEN_PORT)
        });

        console.log(`Server listening at ${address}`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
