import { FastifyReply, FastifyRequest } from 'fastify';
import { getPool } from '../db'; // Aqui obtemos a conexão com o SQL Server
import { alunosSchema } from '../schemas/alunoSchema'; // Ajuste o caminho conforme a estrutura de pastas

interface Aluno {
  nome: string;
  email: string;
  matricula: string;
  curso: string;
}

export async function getAlunos(request: FastifyRequest, reply: FastifyReply) {
  try {
    const pool = getPool();
    const result = await pool.request().query('SELECT * FROM alunos');
    return reply.send(result.recordset);
  } catch (error) {
    console.error('Erro no controller:', error);
    return reply.status(500).send({ message: 'Erro ao processar a requisição' });
  }
}

export async function createAluno(request: FastifyRequest, reply: FastifyReply) {
  try {
    const pool = getPool();

    // Validação usando Zod, omitindo a senha
    const validAluno = alunosSchema.omit({ senha: true }).safeParse(request.body);

    // Verifica se a validação falhou
    if (!validAluno.success) {
      return reply.status(400).send({ message: 'Dados inválidos', errors: validAluno.error.errors });
    }

    // Tipando o resultado da validação como 'Aluno'
    const novoAluno: Aluno = validAluno.data as Aluno;

    // Verifica se algum campo está vazio após validação
    if (!novoAluno.nome || !novoAluno.email || !novoAluno.matricula || !novoAluno.curso) {
      return reply.status(400).send({ message: 'Todos os campos são obrigatórios e não podem estar vazios.' });
    }

    // Insere os dados no banco de dados
    await pool.request()
      .input('nome', novoAluno.nome)
      .input('email', novoAluno.email)
      .input('matricula', novoAluno.matricula)
      .input('curso', novoAluno.curso)
      .query('INSERT INTO alunos (nome, email, matricula, curso) VALUES (@nome, @email, @matricula, @curso)');

    return reply.status(201).send({ message: 'Aluno criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    return reply.status(500).send({ message: 'Erro ao criar aluno' });
  }
}
