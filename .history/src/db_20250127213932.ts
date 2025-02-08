import { ConnectionPool } from 'mssql';

const sqlConfig = {
  server: 'VASC\MSSQLSERVER01', // Nome do servidor SQL Server, com escape para a barra invertida
  database: 'ufc_assistencia', // Nome do seu banco de dados
  options: {
    encrypt: true, // Defina como true se o servidor exigir criptografia
    trustServerCertificate: true, // Caso o certificado SSL não seja confiável
  },
  // Usando a configuração de autenticação integrada do Windows
  trustedConnection: true, // Isso permite a autenticação integrada do Windows
};

let pool: ConnectionPool;

export async function connectSql() {
  try {
    pool = await new ConnectionPool(sqlConfig).connect();
    console.log('Conexão com SQL Server bem-sucedida');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro ao conectar ao SQL Server:', error.message);
      throw error;
    } else {
      console.error('Erro desconhecido ao conectar ao SQL Server:', error);
      throw new Error('Erro desconhecido');
    }
  }
}

export function getPool(): ConnectionPool {
  if (!pool) {
    throw new Error('Banco de dados não está conectado');
  }
  return pool;
}

export async function closeConnection() {
  try {
    await pool.close();
    console.log('Conexão com SQL Server fechada');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro ao fechar a conexão com SQL Server:', error.message);
      throw error;
    } else {
      console.error('Erro desconhecido ao fechar a conexão com SQL Server:', error);
      throw new Error('Erro desconhecido ao fechar a conexão');
    }
  }
}
