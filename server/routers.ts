import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  invokeJarvis,
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
} from "./jarvis-agent";
import {
  createGoal,
  getUserGoals,
  getUserTasks,
  getLatestMetrics,
  getUserOrgStructure,
  getUserInsights,
  getLatestBriefing,
} from "./wealth-db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Jarvis AI Agent routes
  jarvis: router({
    chat: protectedProcedure
      .input(z.object({ message: z.string(), conversationId: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        let conversationId = input.conversationId;

        // Get or create conversation
        if (!conversationId) {
          const conv = await getOrCreateConversation(userId);
          conversationId = conv.id;
        }

        // Invoke Jarvis
        const response = await invokeJarvis(userId, conversationId, input.message);

        return {
          conversationId,
          message: response.message,
          tokens: response.tokens,
          model: response.model,
        };
      }),

    conversations: protectedProcedure.query(async ({ ctx }) => {
      return await getUserConversations(ctx.user.id);
    }),

    messages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await getConversationMessages(ctx.user.id, input.conversationId);
      }),
  }),

  // Wealth management routes
  wealth: router({
    goals: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        return await getUserGoals(ctx.user.id, input.status);
      }),

    createGoal: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          category: z.string().optional(),
          priority: z.string().optional(),
          targetValue: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createGoal(ctx.user.id, {
          title: input.title,
          description: input.description || null,
          category: (input.category as any) || null,
          priority: (input.priority as any) || null,
          targetValue: input.targetValue ? (parseFloat(input.targetValue) as any) : null,
        });
      }),

    tasks: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        return await getUserTasks(ctx.user.id, input.status);
      }),

    metrics: protectedProcedure.query(async ({ ctx }) => {
      return await getLatestMetrics(ctx.user.id);
    }),

    orgStructure: protectedProcedure.query(async ({ ctx }) => {
      return await getUserOrgStructure(ctx.user.id);
    }),

    insights: protectedProcedure.query(async ({ ctx }) => {
      return await getUserInsights(ctx.user.id);
    }),

    briefing: protectedProcedure.query(async ({ ctx }) => {
      return await getLatestBriefing(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
