import { FastifyReply, FastifyRequest } from 'fastify';
import { connectMySQL } from '../db';
import { RowDataPacket } from 'mysql2'; // Importando o tipo correto para as linhas de dados

// Definindo a interface para o usuário
interface User {
  nome: string;
  matricula: string;
  email: string;
  senha: string;
}

export async function createUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL();

    const { nome, matricula, email, senha } = request.body as User;

    // Verificando se todos os campos obrigatórios foram preenchidos
    if (!nome || !matricula || !email || !senha) {
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

    // Verificando se já existe usuário com a mesma matrícula ou email
    const [existingUser]: [RowDataPacket[], mysql.FieldPacket[]] = await connection.execute(
      'SELECT id, matricula, email FROM usuarios WHERE matricula = ? OR email = ?',
      [matricula, email]
    );

    const usersExistentes = existingUser as RowDataPacket[];

    // Especificando se o problema é com a matrícula, o email ou ambos
    if (usersExistentes.length > 0) {
      const matriculaExistente = usersExistentes.some(user => user.matricula === matricula);
      const emailExistente = usersExistentes.some(user => user.email === email);

      if (matriculaExistente && emailExistente) {
        return reply.status(400).send({ message: 'Já existe usuário cadastrado com essa matrícula e email' });
      }

      if (matriculaExistente) {
        return reply.status(400).send({ message: 'Já existe usuário cadastrado com essa matrícula' });
      }

      if (emailExistente) {
        return reply.status(400).send({ message: 'Já existe usuário cadastrado com esse email' });
      }
    }

    // Inserindo o novo usuário no banco de dados
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nome, matricula, email, senha) VALUES (?, ?, ?, ?)',
      [nome, matricula, email, senha]
    );

    const insertId = (result as mysql.ResultSetHeader).insertId;

    return reply.status(201).send({ id: insertId, nome, matricula, email });
  } catch (error: unknown) {
    console.error('Erro ao criar usuário:', error);

    // Tratando o erro de duplicação
    if (error instanceof Error && 'code' in error) {
      const err = error as { code: string }; // Afirmação de tipo
      if (err.code === 'ER_DUP_ENTRY') {
        return reply.status(400).send({ message: 'Já existe usuário cadastrado com esse email ou matrícula' });
      }
    }

    return reply.status(500).send({ message: 'Erro ao criar usuário' });
  }
}
