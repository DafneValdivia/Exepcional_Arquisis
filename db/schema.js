const { Client } = require('pg');
require('dotenv').config();

const db = new Client({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
});

const waitForPostgres = async (delay = 5000) => {
    try {
        console.log('Esperando que PostgreSQL esté listo...');
        await db.connect();  // Intentar conectar a PostgreSQL una vez
        console.log('PostgreSQL está listo.');
    } catch (err) {
        console.error('No se pudo conectar a PostgreSQL:', err);
        throw new Error('No se pudo conectar a PostgreSQL, el contenedor podría no estar listo.');
    }
    await new Promise(resolve => setTimeout(resolve, delay));  // Opcional: esperar un pequeño retraso después de la conexión
};

async function createTables() {
    // Verificar que PostgreSQL esté disponible
    await waitForPostgres();
    console.log('Conectando a la base de datos...');
    try {
        console.log('Conexión exitosa a la base de datos');

        // Crear tablas
        const createFixturesTable = `
            CREATE TABLE IF NOT EXISTS fixtures (
                id SERIAL PRIMARY KEY,
                referee TEXT,
                date TIMESTAMP
            );
        `;
        const createLeagueTable = `
            CREATE TABLE IF NOT EXISTS league (
                id SERIAL PRIMARY KEY,
                fixture_id INT REFERENCES fixtures(id),
                name TEXT,
                country TEXT,
                season INT
            );
        `;
        const createTeamsTable = `
            CREATE TABLE IF NOT EXISTS teams (
                id SERIAL PRIMARY KEY,
                fixture_id INT REFERENCES fixtures(id),
                team_type TEXT CHECK (team_type IN ('home', 'away')),
                name TEXT,
                winner BOOLEAN
            );
        `;
        const createGoalsTable = `
            CREATE TABLE IF NOT EXISTS goals (
                id SERIAL PRIMARY KEY,
                fixture_id INT REFERENCES fixtures(id),
                home INT,
                away INT
            );
        `;
        const createOddsTable = `
            CREATE TABLE IF NOT EXISTS odds (
                id SERIAL PRIMARY KEY,
                fixture_id INT REFERENCES fixtures(id),
                name TEXT,
                values JSON
            );
        `;

        // Ejecutar las consultas para crear las tablas
        await db.query(createFixturesTable);
        await db.query(createLeagueTable);
        await db.query(createTeamsTable);
        await db.query(createGoalsTable);
        await db.query(createOddsTable);

        console.log('Tablas creadas/verificadas correctamente.');
    } catch (err) {
        console.error('Error al crear las tablas:', err);
        throw err;
    } finally {
        await db.end();
        console.log('Conexión a la base de datos cerrada');
    }
}

module.exports = createTables;
