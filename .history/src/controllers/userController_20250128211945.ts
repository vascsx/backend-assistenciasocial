import { FastifyReply, FastifyRequest } from 'fastify';
import { connectMySQL } from '../db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';  // Importando a tipagem correta

// Definindo a interface para o usuário
interface User {
  nomeCompleto: string;
  matricula: string;
  email: string;
  senha: string;
}



























export async function createAssistant(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL();

    // Verificando se o usuário master está logado (matricula e email específicos)
    const { matricula, email, senha, nomeCompleto } = request.body as User;
    const masterEmail = 'andersonvasc@alu.ufc';
    const masterMatricula = '556763';

    if (matricula !== masterMatricula || email !== masterEmail) {
      return reply.status(403).send({ message: 'Somente o usuário master pode cadastrar assistentes' });
    }

    // Verificando se todos os campos obrigatórios foram preenchidos
    if (!nomeCompleto || !matricula || !senha || !email) {
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

    // Criptografando a senha antes de armazenar
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Inserindo o novo assistente no banco de dados
    const [result] = await connection.execute(
      'INSERT INTO users (nomeCompleto, matricula, curso, senha, email) VALUES (?, ?, ?, ?, ?)',
      [nomeCompleto, matricula, 'Assistente', hashedPassword, email]
    );

    const insertId = (result as { insertId: number }).insertId;

    return reply.status(201).send({ id: insertId, nomeCompleto, matricula, email });
  } catch (error) {
    console.error('Erro ao criar assistente:', error);
    return reply.status(500).send({ message: 'Erro ao criar assistente' });
  }
}
