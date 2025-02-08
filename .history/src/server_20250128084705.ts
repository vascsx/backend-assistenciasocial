import { fastify } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import mysql from 'mysql2/promise'; // Usando mysql2 para MySQL
import { alunosSwagger } from './swagger/alunosSwagger';

const app = fastify().withTypeProvider<ZodTypeProvider>();

// Configuração de conexão MySQL
const mysqlConfig = {
  host: 'localhost', // Endereço do servidor MySQL
  user: 'root', // Seu usuário MySQL
  password: '', // Sua senha MySQL
  database: 'ufc_assistencia', // Nome do banco de dados
};

let connection: mysql.Connection;

// Função para conectar ao MySQL
async function connectMySQL() {
  try {
    connection = await mysql.createConnection(mysqlConfig);
    console.log('Conectado ao MySQL!');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro ao conectar ao MySQL:', error.message);
      throw error;
    } else {
      console.error('Erro desconhecido ao conectar ao MySQL:', error);
      throw new Error('Erro desconhecido');
    }
  }
}

// Função para fechar a conexão com MySQL
async function closeConnection() {
  try {
    await connection.end();
    console.log('Conexão com MySQL fechada');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro ao fechar a conexão com MySQL:', error.message);
      throw error;
    } else {
      console.error('Erro desconhecido ao fechar a conexão com MySQL:', error);
      throw new Error('Erro desconhecido ao fechar a conexão');
    }
  }
}

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
    // Conectar ao MySQL
    await connectMySQL();

    // Endpoints
    app.get('/alunos', async (request, reply) => {
      const [alunos] = await connection.execute('SELECT * FROM alunos'); // Consultando os alunos
      return reply.send(alunos);
    });

    app.post('/alunos', async (request, reply) => {
      const { nome, matricula, curso } = request.body;
      const [result] = await connection.execute(
        'INSERT INTO alunos (nome, matricula, curso) VALUES (?, ?, ?)',
        [nome, matricula, curso]
      );
      return reply.status(201).send({ id: result.insertId, nome, matricula, curso });
    });

    const address = await app.listen({ port, host: '0.0.0.0' });
    console.log(`Servidor rodando em ${address}`);
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
}

app.addHook('onClose', async () => {
  await closeConnection(); // Fechando a conexão com MySQL
});

start();
