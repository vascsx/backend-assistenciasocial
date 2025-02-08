import { fastify } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { PrismaClient } from '@prisma/client'; // Importando o Prisma Client
import { alunosSwagger } from './swagger/alunosSwagger';

const app = fastify().withTypeProvider<ZodTypeProvider>();

const prisma = new PrismaClient(); // Instanciando o Prisma Client

app.register(import('@fastify/cors'), {
  origin: '*',
});

app.register(fastifySwagger, alunosSwagger);

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: true,
  transformStaticCSP: (header: string): string => header,
});

const port = 3333;

async function start() {
  try {
    // Conexão com Prisma
    await prisma.$connect();
    console.log('Conectado ao SQL Server com Prisma!');

    // Endpoints
    app.get('/alunos', async (request, reply) => {
      const alunos = await prisma.aluno.findMany(); // Consultando os alunos
      return reply.send(alunos);
    });

    app.post('/alunos', async (request, reply) => {
      const novoAluno = await prisma.aluno.create({
        data: request.body,
      });
      return reply.status(201).send(novoAluno);
    });

    const address = await app.listen({ port, host: '0.0.0.0' });
    console.log(`Servidor rodando em ${address}`);
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
}

app.addHook('onClose', async () => {
  await prisma.$disconnect(); // Fechando a conexão com o Prisma
  console.log('Conexão com SQL Server fechada');
});

start();
