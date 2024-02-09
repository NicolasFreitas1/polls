import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { prisma } from "../../lib/prisma";

export async function getPoll(app: FastifyInstance) {
  app.get(
    "/polls/:pollId",
    async (req: FastifyRequest, reply: FastifyReply) => {
      const getPollParam = z.object({
        pollId: z.string().uuid(),
      });

      const { pollId } = getPollParam.parse(req.params);

      const poll = await prisma.poll.findUnique({
        where: {
          id: pollId,
        },
        include: {
          options: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      return reply.status(201).send({ poll });
    }
  );
}
