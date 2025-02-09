import { FastifyReply, FastifyRequest } from 'fastify';
import { connectMySQL } from '../db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';

interface User {
  nomeCompleto: string;
  matricula: string;
  email: string;
  senha: string;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidMatricula(matricula: string): boolean {
  return /^\d+$/.test(matricula);
}

export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL();
    const { nomeCompleto, matricula, email, senha } = request.body as User;

    if (!nomeCompleto || !matricula || !email || !senha) {
      return reply.status(400).send({ message: 'Todos os campos são obrigatórios' });
    }

    if (!isValidEmail(email)) {
      return reply.status(400).send({ message: 'O email informado é inválido' });
    }

    if (!isValidMatricula(matricula)) {
      return reply.status(400).send({ message: 'A matrícula deve conter apenas números' });
    }

    let tipoUsuario: 'Usuário' | 'Assistente';
    if (email.endsWith('@ufc.br')) {
      tipoUsuario = 'Assistente';
    } else if (email.endsWith('@alu.ufc.br')) {
      tipoUsuario = 'Usuário';
    } else {
      return reply.status(403).send({ message: 'Permitido somente cadastro com email Institucional' });
    }

    // Verifica se já existe um usuário com o mesmo email ou matrícula
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ? OR matricula = ?',
      [email, matricula]
    );

    if ((existingUsers as RowDataPacket[]).length > 0) {
      return reply.status(409).send({ message: 'Email ou matrícula já cadastrados' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const [result] = await connection.execute(
      'INSERT INTO users (nome_completo, matricula, email, senha, tipo_usuario) VALUES (?, ?, ?, ?, ?)',
      [nomeCompleto, matricula, email, hashedPassword, tipoUsuario]
    );

    return reply.status(201).send({
      id: (result as { insertId: number }).insertId,
      nomeCompleto,
      matricula,
      email,
      tipoUsuario
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    return reply.status(500).send({ message: 'Erro interno ao cadastrar usuário' });
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL();
    const { identificador, senha } = request.body as { identificador: string; senha: string };

    if (!identificador || !senha) {
      return reply.status(400).send({ message: 'Identificador e senha são obrigatórios' });
    }

    const [userRows] = await connection.execute(
      `SELECT id, nome_completo, matricula, senha, email, tipo_usuario FROM users WHERE matricula = ? OR email = ?`,
      [identificador, identificador]
    );

    const user = (userRows as RowDataPacket[])[0];

    if (!user) {
      return reply.status(404).send({ message: 'Usuário não encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      return reply.status(401).send({ message: 'Senha incorreta' });
    }

    // Atualiza o campo `ultimo_login`
    await connection.execute('UPDATE users SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const { senha: _, ...userWithoutPassword } = user;

    // Definir para qual tela redirecionar
    let redirectTo = '/dash';
    if (user.tipo_usuario === 'Assistente') {
      redirectTo = '/dashboard-assistente';
    }

    return reply.status(200).send({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      redirectTo
    });

  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return reply.status(500).send({ message: 'Erro interno ao realizar login' });
  }
}
