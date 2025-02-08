import { fastify } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { connectMySQL, closeConnection } from './db';
import { login, createAssistant } from './controllers/userController';
import { usersSwagger } from './swagger/usersSwagger';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifySwagger, {
  openapi: usersSwagger.openapi,
});

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: true,
  transformStaticCSP: (header: string): string => header,
});

app.register(import('@fastify/cors'), {
  origin: '*',
});

const port = 3333;

async function start() {
  try {
    await connectMySQL();

    app.post('/login', login);
    app.post('/create-assistant', createAssistant);

    const address = await app.listen({ port, host: '0.0.0.0' });
    console.log(`Servidor rodando em ${address}`);
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
}

app.addHook('onClose', async () => {
  await closeConnection();
});

start();
