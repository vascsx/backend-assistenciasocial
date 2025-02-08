import { FastifyReply, FastifyRequest } from 'fastify';
import { connectMySQL } from '../db'; // Usando a conexão compartilhada

// Definindo o tipo esperado para os dados de aluno
interface Aluno {
  nome: string;
  matricula: string;
  curso: string;
}

export async function getAlunos(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL(); // Usando a conexão compartilhada
    const [alunos] = await connection.execute('SELECT * FROM alunos');
    return reply.send(alunos);
  } catch (error) {
    console.error('Erro no controller:', error);
    return reply.status(500).send({ message: 'Erro ao processar a requisição' });
  }
}

export async function createAluno(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL(); // Usando a conexão compartilhada

    // Tipando explicitamente o corpo da requisição
    const { nome, matricula, curso } = request.body as Aluno;

    // Verifica se todos os campos obrigatórios foram passados
    if (!nome || !matricula || !curso) {
      return reply.status(400).send({ message: 'Todos os campos são obrigatórios' });
    }

    const [result] = await connection.execute(
      'INSERT INTO alunos (nome, matricula, curso) VALUES (?, ?, ?)',
      [nome, matricula, curso]
    );
    return reply.status(201).send({ id: result.insertId, nome, matricula, curso });
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    return reply.status(500).send({ message: 'Erro ao criar aluno' });
  }
}
