import { fastify } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { connectMySQL, closeConnection } from './db'; // Conexão compartilhada do banco de dados
import { login, createAssistant } from './controllers/userController'; // Importando os controllers
import { usersSwagger } from './swagger/usersSwagger'; // Swagger específico para usuários

const app = fastify().withTypeProvider<ZodTypeProvider>();

// Configurações do Swagger
app.register(fastifySwagger, {
  openapi: usersSwagger.openapi, // Use o objeto de configuração correto
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

// Middleware CORS para permitir requisições de qualquer origem
app.register(import('@fastify/cors'), {
  origin: '*',
});

// Configuração de Porta
const port = 3333;

// Função para iniciar o servidor
async function start() {
  try {
    // Conectar ao MySQL
    await connectMySQL();

    // Definindo as rotas
    app.post('/login', login); // Rota POST para realizar login
    app.post('/create-assistant', createAssistant); // Rota POST para criar assistente

    // Iniciar o servidor
    const address = await app.listen({ port, host: '0.0.0.0' });
    console.log(`Servidor rodando em ${address}`);
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
}

// Hook para fechar a conexão com o banco quando o servidor for encerrado
app.addHook('onClose', async () => {
  await closeConnection(); // Fechando a conexão com MySQL
});

// Iniciar o servidor
start();
