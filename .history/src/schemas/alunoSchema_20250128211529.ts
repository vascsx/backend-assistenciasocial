import { z } from 'zod';

// Define o schema de aluno com 'senha' como opcional
export const userSch = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  matricula: z.string().min(1),
  curso: z.string().min(1),
  senha: z.string().optional(), // Senha é opcional
});
