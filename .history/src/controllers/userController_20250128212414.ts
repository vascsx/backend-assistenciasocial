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

// Função de login
export async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const connection = await connectMySQL();

    const { identificador, senha } = request.body as { identificador: string; senha: string };

    // Validação básica
    if (!identificador || !senha) {
      return reply.status(400).send({ message: 'Identificador (matrícula ou email) e senha são obrigatórios' });
    }

    // Determinando se o identificador é um email ou uma matrícula
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identificador);
    const queryField = isEmail ? 'email' : 'matricula';

    // Buscando o usuário pelo identificador
    const [userRows] = await connection.execute(
      `SELECT id, nomeCompleto, matricula, senha, email FROM users WHERE ${queryField} = ?`,
      [identificador]
    );

    const user = (userRows as RowDataPacket[])[0]; // Tipando corretamente o resultado

    if (!user) {
      return reply.status(400).send({ message: 'Usuário não encontrado' });
    }

    // Verificando a senha fornecida com a senha criptografada no banco de dados
    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      return reply.status(400).send({ message: 'Senha incorreta' });
    }

    // Verificando se é um assistente (matricula e email específicos)
    if (user.matricula === '556763' && user.email === 'andersonvasc@alu.ufc') {
      return reply.status(200).send({ message: 'Login com acesso de assistente', user });
    }

    // Caso seja um usuário normal, redireciona para a página do usuário normal
    return reply.status(200).send({ message: 'Login realizado com sucesso', user });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return reply.status(500).send({ message: 'Erro ao realizar login' });
  }
}

// Função para criar um assistente
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
