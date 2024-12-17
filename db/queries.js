const { Client } = require('pg');
require('dotenv').config();

const db = new Client({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
});

async function insertData(data) {
    try {
        await db.connect();

        // Insertar en fixtures
        const fixtureResult = await db.query(
            `INSERT INTO fixtures (id, referee, date)
             VALUES ($1, $2, $3)
             ON CONFLICT (id) DO NOTHING RETURNING id;`,
            [data.fixtures.id, data.fixtures.referee, data.fixtures.date]
        );

        const fixtureId = fixtureResult.rows[0]?.id || data.fixtures.id;

        // Insertar en league
        await db.query(
            `INSERT INTO league (fixture_id, name, country, season)
             VALUES ($1, $2, $3, $4);`,
            [fixtureId, data.league.name, data.league.country, data.league.season]
        );

        // Insertar en teams (home y away)
        for (const teamType of ['home', 'away']) {
            await db.query(
                `INSERT INTO teams (fixture_id, team_type, name, winner)
                 VALUES ($1, $2, $3, $4);`,
                [fixtureId, teamType, data.teams[teamType].name, data.teams[teamType].winner]
            );
        }

        // Insertar en goals
        await db.query(
            `INSERT INTO goals (fixture_id, home, away)
             VALUES ($1, $2, $3);`,
            [fixtureId, data.goals.home, data.goals.away]
        );

        // Insertar en odds (valores como JSON)
        for (const odd of data.odds) {
            await db.query(
                `INSERT INTO odds (fixture_id, name, values)
                 VALUES ($1, $2, $3);`,
                [fixtureId, odd.name, JSON.stringify(odd.values)]
            );
        }

        console.log('Datos insertados correctamente.');
    } catch (err) {
        console.error('Error al insertar datos:', err);
    } finally {
        await db.end();
    }
}

module.exports = insertData;
