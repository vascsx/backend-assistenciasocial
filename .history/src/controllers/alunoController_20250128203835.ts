import { FastifyReply, FastifyRequest } from 'fastify';
import { connectMySQL } from '../db';
import mysql from 'mysql2/promise';

interface Aluno {
  nome: string;
  matricula: string;
  curso: string;
  email: string;
}

// Importando as dependências necessárias
import { FastifyReply, FastifyRequest } from 'fastify';
import { connectMySQL } from '../db';
import mysql from 'mysql2/promise';

// Definindo a interface para o aluno
interface Aluno {
  nome: string;
  matricula: string;
  curso: string;
  email: string;
}

// Função para criar aluno
export async function createAluno(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL();

    const { nome, matricula, curso, email } = request.body as Aluno;

    if (!nome || !matricula || !curso || !email) {
      return reply.status(400).send({ message: 'Todos os campos são obrigatórios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return reply.status(400).send({ message: 'O email informado é inválido' });
    }

    if (!/^\d+$/.test(matricula)) {
      return reply.status(400).send({ message: 'A matrícula deve conter apenas números' });
    }

    const [existingAluno] = await connection.execute(
      'SELECT id FROM alunos WHERE matricula = ? OR email = ?',
      [matricula, email]
    );

    if ((existingAluno as any[]).length > 0) {
      return reply.status(400).send({ message: 'Já existe aluno cadastrado com esse email ou matrícula' });
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


export async function getAlunos(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL();

    const [rows] = await connection.execute('SELECT * FROM alunos');

    return reply.status(200).send(rows);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    return reply.status(500).send({ message: 'Erro ao buscar alunos' });
  }
}
