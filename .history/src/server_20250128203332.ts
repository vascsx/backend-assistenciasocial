import { fastify } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { connectMySQL, closeConnection } from './db'; // Conexão compartilhada do banco de dados
import { alunosSwagger } from './swagger/alunosSwagger';
import { , createAluno } from './controllers/alunoController'; // Importando os controllers

const app = fastify().withTypeProvider<ZodTypeProvider>();

// Configurações do Swagger
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
    app.get('/alunos', getAlunos); // Rota GET para listar alunos
    app.post('/alunos', createAluno); // Rota POST para criar aluno

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
