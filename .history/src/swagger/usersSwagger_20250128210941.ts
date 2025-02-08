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
                required: ['nomeCompleto', 'email', 'matricula', 'senha'],
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
          400: {
            description: 'Campos obrigatórios não preenchidos ou dados inválidos',
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
    '/login': {
      post: {
        summary: 'Login do usuário',
        description: 'Autentica um usuário no sistema com matrícula, email e senha.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  matricula: { type: 'string' },
                  email: { type: 'string' },
                  senha: { type: 'string' },
                },
                required: ['matricula', 'email', 'senha'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        nomeCompleto: { type: 'string' },
                        matricula: { type: 'string' },
                        email: { type: 'string' },
                        curso: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Matrícula, email ou senha incorretos',
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
    '/create-assistant': {
      post: {
        summary: 'Cria um novo assistente',
        description: 'Cria um assistente no sistema, disponível apenas para o usuário master.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nomeCompleto: { type: 'string' },
                  email: { type: 'string' },
                  matricula: { type: 'string' },
                  senha: { type: 'string' },
                },
                required: ['nomeCompleto', 'email', 'matricula', 'senha'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Assistente criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        nomeCompleto: { type: 'string' },
                        matricula: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          403: {
            description: 'Acesso negado, apenas o usuário master pode criar assistentes',
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
          400: {
            description: 'Campos obrigatórios não preenchidos ou dados inválidos',
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
