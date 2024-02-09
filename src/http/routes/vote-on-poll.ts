import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { prisma } from "../../lib/prisma";
import { randomUUID } from "node:crypto";

export async function voteOnPoll(app: FastifyInstance) {
  app.post(
    "/polls/:pollId/votes",
    async (req: FastifyRequest, reply: FastifyReply) => {
      const voteOnPollBody = z.object({
        pollOptionId: z.string().uuid(),
      });

      const voteOnPollParams = z.object({
        pollId: z.string().uuid(),
      });

      const { pollId } = voteOnPollParams.parse(req.params);
      const { pollOptionId } = voteOnPollBody.parse(req.body);

      let { sessionId } = req.cookies;

      if (sessionId) {
        const userPreviousVotesOnPoll = await prisma.vote.findUnique({
          where: {
            sessionId_pollId: {
              pollId,
              sessionId,
            },
          },
        });

        if (
          userPreviousVotesOnPoll &&
          userPreviousVotesOnPoll.pollOptionId !== pollOptionId
        ) {
          await prisma.vote.delete({
            where: {
              id: userPreviousVotesOnPoll.id,
            },
          });
        } else if (userPreviousVotesOnPoll) {
          return reply.status(400).send({
            message: "You already voted on this poll",
          });
        }
      }

      if (!sessionId) {
        sessionId = randomUUID();

        reply.setCookie("sessionId", sessionId, {
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          signed: true,
          httpOnly: true,
        });
      }

      await prisma.vote.create({
        data: {
          sessionId,
          pollId,
          pollOptionId,
        },
      });

      return reply.status(201).send();
    }
  );
}
