import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const app = fastify();

const prisma = new PrismaClient();

app.post("/polls", async (req: FastifyRequest, reply: FastifyReply) => {
  const createPollBody = z.object({
    title: z.string(),
  });

  const { title } = createPollBody.parse(req.body);

  const poll = await prisma.poll.create({
    data: {
      title,
    },
  });

  return reply.status(201).send({ pollId: poll.id });
});

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running!");
});
