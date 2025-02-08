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

  
    const connection = await connectMySQL();

    const { nome, matricula, curso, email } = request.body as Aluno;

    // Verificando se todos os campos obrigatórios foram preenchidos
    if (!nome || !matricula || !curso || !email) {
      return reply.status(400).send({ message: 'Todos os campos são obrigatórios' });
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return reply.status(400).send({ message: 'O email informado é inválido' });
    }

    // Validação da matrícula (deve ser um número)
    if (!/^\d+$/.test(matricula)) {
      return reply.status(400).send({ message: 'A matrícula deve conter apenas números' });
    }

    // Verificando se já existe aluno com a mesma matrícula ou email
    const [existingAluno] = await connection.execute(
      'SELECT id, matricula, email FROM alunos WHERE matricula = ? OR email = ?',
      [matricula, email]
    );

    const alunosExistentes = existingAluno as any[];

    // Especificando se o problema é com a matrícula, o email ou ambos
    if (alunosExistentes.length > 0) {
      const matriculaExistente = alunosExistentes.some(aluno => aluno.matricula === matricula);
      const emailExistente = alunosExistentes.some(aluno => aluno.email === email);

      if (matriculaExistente && emailExistente) {
        return reply.status(400).send({ message: 'Já existe aluno cadastrado com essa matrícula e email' });
      }

      if (matriculaExistente) {
        return reply.status(400).send({ message: 'Já existe aluno cadastrado com essa matrícula' });
      }

      if (emailExistente) {
        return reply.status(400).send({ message: 'Já existe aluno cadastrado com esse email' });
      }
    }

    // Inserindo o novo aluno no banco de dados
    const [result] = await connection.execute(
      'INSERT INTO alunos (nome, matricula, curso, email) VALUES (?, ?, ?, ?)',
      [nome, matricula, curso, email]
    );

    const insertId = (result as mysql.ResultSetHeader).insertId;

    return reply.status(201).send({ id: insertId, nome, matricula, curso, email
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
