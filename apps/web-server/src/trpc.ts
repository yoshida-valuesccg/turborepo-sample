import { initTRPC } from '@trpc/server';
import { NodeHTTPCreateContextFnOptions } from '@trpc/server/adapters/node-http';
import { FastifyReply, FastifyRequest } from 'fastify';

export type Context = {};

const t = initTRPC.context<Context>().create({
    isDev: process.env.NODE_ENV === 'development'
});

export const createContext = async (opts: NodeHTTPCreateContextFnOptions<FastifyRequest, FastifyReply>) => {
    return {};
};

export const router = t.router;
export const publicProcedure = t.procedure.use(async (opts) => {
    const result = await opts.next({
        ctx: {}
    });

    return result;
});
