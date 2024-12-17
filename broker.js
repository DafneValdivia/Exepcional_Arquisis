require('dotenv').config(); // Cargar variables del .env
const mqtt = require('mqtt');
const createTables = require('./db/schema');
const insertData = require('./db/queries');

// Configuración del cliente MQTT
const client = mqtt.connect({
    host: process.env.BROKER_HOST,
    port: process.env.BROKER_PORT,
    username: process.env.BROKER_USER,
    password: process.env.BROKER_PASSWORD,
});


async function startApplication() {
    // Crear/verificar las tablas
    await createTables();

    // Suscripción al canal MQTT
    client.on('connect', () => {
        console.log('Conectado al broker MQTT');
        client.subscribe(process.env.MQTT_CHANNEL, (err) => {
            if (err) console.error('Error al suscribirse:', err);
        });
    });

    // Manejar los mensajes recibidos
    client.on('message', async (topic, message) => {
        const data = JSON.parse(message.toString());
        console.log('Mensaje recibido:', data);

        // Insertar los datos en la base de datos
        await insertData(data);
    });
}

startApplication();
