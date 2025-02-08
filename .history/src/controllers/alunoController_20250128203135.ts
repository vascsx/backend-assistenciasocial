import { FastifyReply, FastifyRequest } from 'fastify';
import { connectMySQL } from '../db'; // Usando a conexão compartilhada
import mysql from 'mysql2/promise'; // Corrigido para importar os tipos do mysql2


 // Adicione o campo 'email' à interface Aluno
interface Aluno {
  nome: string;
  matricula: string;
  curso: string;
  email: string; // Adicionado
}

export async function createAluno(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL();

    // Adicione 'email' ao corpo da requisição
    const { nome, matricula, curso, email } = request.body as Aluno;

    if (!nome || !matricula || !curso || !email) {
      return reply.status(400).send({ message: 'Todos os campos são obrigatórios' });
    }

    const [result] = await connection.execute(
      'INSERT INTO alunos (nome, matricula, curso, email) VALUES (?, ?, ?, ?)',
      [nome, matricula, curso, email]
    );

    const insertId = (result as mysql.ResultSetHeader).insertId;

    return reply.status(201).send({ id: insertId, nome, matricula, curso, email });
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    return reply.status(500).send({ message: 'Erro ao criar aluno' });
  }
}














