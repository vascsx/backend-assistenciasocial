// src/swagger/usersSwagger.ts

export const usersSwagger = {
  openapi: {
    info: {
      title: 'Assistente Social',
      description: 'Documentação da API do Assistente Social - Usuários',
      version: '1.0.0',
    },
  },
  paths: {
    '/users': {
      get: {
        summary: 'Lista todos os usuários',
        description: 'Retorna todos os usuários cadastrados no sistema.',
        responses: {
          200: {
            description: 'Lista de usuários',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      nomeCompleto: { type: 'string' },
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
        summary: 'Cria um novo usuário',
        description: 'Adiciona um usuário ao sistema.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nomeCompleto: { type: 'string' },
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
            description: 'Usuário criado com sucesso',
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
