// src/swagger/alunosSwagger.ts

export const alunosSwagger = {
    openapi: {
      info: {
        title: 'Assistente Social',
        description: 'Documentação da API do Assistente Social',
        version: '1.0.0',
      },
    },
    paths: {
      '/alunos': {
        get: {
          summary: 'Lista todos os alunos',
          description: 'Retorna todos os alunos cadastrados no sistema.',
          responses: {
            200: {
              description: 'Lista de alunos',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        nome: { type: 'string' },
                        email: { type: 'string' },
                        matricula: { type: 'string' },
                        curso: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Cria um novo aluno',
          description: 'Adiciona um aluno ao sistema.',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nome: { type: 'string' },
                    email: { type: 'string' },
                    matricula: { type: 'string' },
                    curso: { type: 'string' },
                    senha: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Aluno criado com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  