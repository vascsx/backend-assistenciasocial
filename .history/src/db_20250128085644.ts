import mysql from 'mysql2/promise';

const mysqlConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'assistencia_social',
};

let connection: mysql.Connection;

export async function connectMySQL() {
  if (!connection) {
    connection = await mysql.createConnection(mysqlConfig);
    console.log('Conectado ao MySQL!');
  }
  return connection;
}

export async function closeConnection() {
  if (connection) {
    await connection.end();
    console.log('Conexão com MySQL fechada');
  }
}
