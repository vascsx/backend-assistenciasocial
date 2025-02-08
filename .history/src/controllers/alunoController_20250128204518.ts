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


s' });




);



números' });



',





 === matricula);
il);

m essa matrícula e email' });


m essa matrícula' });




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
