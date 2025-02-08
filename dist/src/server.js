"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fastify_1 = require("fastify");
const sqlServerDB_1 = require("./sqlServerDB");
const swagger_1 = tslib_1.__importDefault(require("@fastify/swagger"));
const swagger_ui_1 = tslib_1.__importDefault(require("@fastify/swagger-ui"));
const zod_1 = require("zod");
const mssql_1 = tslib_1.__importDefault(require("mssql"));
const app = (0, fastify_1.fastify)().withTypeProvider();
app.register(Promise.resolve().then(() => tslib_1.__importStar(require('@fastify/cors'))), {
    origin: '*',
});
app.register(swagger_1.default, {
    openapi: {
        info: {
            title: 'Assistente Social',
            description: 'Documentação da API do Assistente Social',
            version: '1.0.0',
        },
    },
});
app.register(swagger_ui_1.default, {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
});
const port = 3333;
function start() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield sqlServerDB_1.db;
            yield pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='alunos' AND xtype='U')
      CREATE TABLE alunos (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        nome NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL,
        matricula NVARCHAR(50) NOT NULL,
        curso NVARCHAR(255) NOT NULL
      );
    `);
            console.log('Tabela "alunos" pronta.');
            app.get('/alunos', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    const result = yield pool.request().query('SELECT id, nome, email, matricula, curso FROM alunos');
                    return result.recordset;
                }
                catch (error) {
                    console.error('Erro ao listar alunos:', error);
                    throw new Error('Erro ao listar alunos');
                }
            }));
            app.post('/alunos', (request, reply) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const schema = zod_1.z.object({
                    nome: zod_1.z.string().min(1),
                    email: zod_1.z.string().email(),
                    matricula: zod_1.z.string().min(1),
                    curso: zod_1.z.string().min(1),
                });
                const { nome, email, matricula, curso } = schema.parse(request.body);
                try {
                    yield pool.request()
                        .input('nome', mssql_1.default.NVarChar, nome)
                        .input('email', mssql_1.default.NVarChar, email)
                        .input('matricula', mssql_1.default.NVarChar, matricula)
                        .input('curso', mssql_1.default.NVarChar, curso)
                        .query(`
            INSERT INTO alunos (nome, email, matricula, curso)
            VALUES (@nome, @email, @matricula, @curso);
          `);
                    return reply.status(201).send({ nome, matricula });
                }
                catch (error) {
                    console.error('Erro ao criar aluno:', error);
                    return reply.status(500).send('Erro ao criar aluno');
                }
            }));
            const address = yield app.listen({ port, host: '0.0.0.0' });
            console.log(`Servidor rodando em ${address}`);
        }
        catch (err) {
            console.error('Erro ao iniciar o servidor:', err);
            process.exit(1);
        }
    });
}
start();
//# sourceMappingURL=server.js.map