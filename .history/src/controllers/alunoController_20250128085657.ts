import { FastifyReply, FastifyRequest } from 'fastify';
import { connectMySQL } from '../db'; // Agora estamos usando a função de conexão compartilhada

export async function getAlunos(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL();
    const [alunos] = await connection.execute('SELECT * FROM alunos');
    return reply.send(alunos);
  } catch (error) {
    console.error('Erro no controller:', error);
    return reply.status(500).send({ message: 'Erro ao processar a requisição' });
  }
}

export async function createAluno(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL();
    const { nome, matricula, curso } = request.body;
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
