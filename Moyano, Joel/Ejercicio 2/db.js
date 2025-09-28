import mysql from "mysql2/promise";
export let db;

// Conectar a la base de datos
export async function conectarDB() {
    db = await mysql.createConnection({
        host: process.env.DB_HOST, // dominio o IP
        user: process.env.DB_USER, // usuario
        password: process.env.DB_PASS, // contraseña
        database: process.env.DB_NAME, // nombre de la base de datos o esquema
    });
}