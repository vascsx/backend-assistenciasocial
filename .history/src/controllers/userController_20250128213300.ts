import { FastifyReply, FastifyRequest } from 'fastify';
import { connectMySQL } from '../db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2'; // Importando a tipagem correta

// Definindo a interface para o usuário
interface User {
  nomeCompleto: string;
  matricula: string;
  email: string;
  senha: string;
}

// Função para validar o email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para validar a matrícula
function isValidMatricula(matricula: string): boolean {
  return /^\d+$/.test(matricula);
}

// Função de login
export async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL();

    const { identificador, senha } = request.body as { identificador: string; senha: string };

    // Validação básica
    if (!identificador || !senha) {
      return reply.status(400).send({ message: 'Identificador e senha são obrigatórios' });
    }

    // Buscando o usuário pelo identificador (pode ser matrícula ou email)
    const [userRows] = await connection.execute(
      `SELECT id, nomeCompleto, matricula, senha, email FROM users WHERE matricula = ? OR email = ?`,
      [identificador, identificador]
    );

    const user = (userRows as RowDataPacket[])[0]; // Tipando corretamente o resultado

    // Verificar se o usuário existe
    if (!user) {
      return reply.status(404).send({ message: 'Usuário não encontrado' });
    }

    // Verificando a senha fornecida com a senha criptografada no banco de dados
    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      return reply.status(401).send({ message: 'Senha incorreta' });
    }

    // Remover a senha do retorno para segurança
    const { senha: _, ...userWithoutPassword } = user;

    // Verificando se é um assistente (matricula e email específicos)
    if (user.matricula === '556763' && user.email === 'andersonvasc@alu.ufc') {
      return reply.status(200).send({ message: 'Login com acesso de assistente', user: userWithoutPassword });
    }

    // Caso seja um usuário normal
    return reply.status(200).send({ message: 'Login realizado com sucesso', user: userWithoutPassword });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return reply.status(500).send({ message: 'Erro interno ao realizar login' });
  }
}

// Função para criar um assistente
export async function createAssistant(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL();

    const { matricula, email, senha, nomeCompleto } = request.body as User;
    const masterEmail = 'andersonvasc@alu.ufc';
    const masterMatricula = '556763';

    // Verificando se o usuário master está logado
    if (matricula !== masterMatricula || email !== masterEmail) {
      return reply.status(403).send({ message: 'Somente o usuário master pode cadastrar assistentes' });
    }

    // Verificando se todos os campos obrigatórios foram preenchidos
    if (!nomeCompleto || !matricula || !senha || !email) {
      return reply.status(400).send({ message: 'Todos os campos são obrigatórios' });
    }

    // Validação do email
    if (!isValidEmail(email)) {
      return reply.status(400).send({ message: 'O email informado é inválido' });
    }

    // Validação da matrícula
    if (!isValidMatricula(matricula)) {
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
    return reply.status(500).send({ message: 'Erro interno ao criar assistente' });
  }
}
