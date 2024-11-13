import { z } from "zod";
import { adminProcedure, publicProcedure, t } from "../trpc-router";
import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { createSession } from "@/lib/session";
import { Prisma } from "@prisma/client";
import axios from "axios";

export const adminRouter = t.router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(({ input }) => {
      const logins = [
        {
          email: "pagnovo@admin",
          password: "l3eqan0z91ad8f0",
        },
      ];

      const user = logins.find(
        (login) =>
          login.email === input.email && login.password === input.password
      );

      if (user) {
        return {
          token: createSession({
            userId: "123",
            email: user.email,
            role: "ADMIN",
          }),
        };
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }),
  session: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getDashboard: adminProcedure.query(async () => {
    const countTickets = await prisma.ticket.count();
    const countApprovedTickets = await prisma.ticket.count({
      where: {
        status: "APPROVED",
      },
    });
    const countPendingTickets = await prisma.ticket.count({
      where: {
        status: "PENDING",
      },
    });
    const countRejectedTickets = await prisma.ticket.count({
      where: {
        status: "REJECTED",
      },
    });

    return {
      countTickets,
      countApprovedTickets,
      countPendingTickets,
      countRejectedTickets,
    };
  }),
  getTickets: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().int().default(10),
        page: z.number().int().default(0),
      })
    )
    .query(async ({ input }) => {
      const where: Prisma.ticketWhereInput = {
        OR: [
          {
            full_name: {
              contains: input.search,
            },
          },
          {
            email: {
              contains: input.search,
            },
          },
          {
            phone: {
              contains: input.search,
            },
          },
          {
            partner_full_name: {
              contains: input.search,
            },
          },
          {
            custom_id: {
              contains: input.search,
            },
          },
        ],
      };

      const tickets = await prisma.ticket.findMany({
        where,
        take: input.limit,
        skip: input.page * input.limit,
        orderBy: {
          created_at: "desc",
        },
      });

      const count = await prisma.ticket.count({
        where,
      });

      return {
        data: tickets,
        count,
      };
    }),

  getTicket: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const ticket = await prisma.ticket.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });

      delete (ticket as any).commercial_contract_file_url;

      return ticket;
    }),

  updateTicket: adminProcedure
    .input(
      z.object({
        status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const ticket = await prisma.ticket.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
        },
      });

      const formatterStatus = {
        PENDING: "ANALYSING",
        APPROVED: "ACTIVE",
        REJECTED: "REJECTED",
      };

      await axios.put(
        "https://api.pagnovo.com/kyc/updated-status-enterprise",
        {
          id: ticket.external_user_id,
          status: formatterStatus[input.status],
        },
        {
          headers: {
            Authorization: `KYC KaT92zI5hiMnAoH-kyc-4d2loe872462qobvoi3y80lait3b3k`,
          },
        }
      );
    }),
});
