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

async function connectAndSubscribe() {
    return new Promise((resolve, reject) => {
        client.on('connect', () => {
            console.log('Conectado al broker MQTT');
            client.subscribe("fixtures/info", (err) => {
                if (err) {
                    reject(`Error al suscribirse: ${err}`);
                } else {
                    console.log(`Suscrito al canal: ${process.env.MQTT_CHANNEL}`);
                    //resolve();   La conexión y la suscripción fueron exitosas
                }
            });
        });

        console.log("Cliente conectado:", client);

        client.on('error', (err) => {
            reject(`Error al conectar con el broker MQTT: ${err}`);
        });
    });
}

async function startApplication() {
    try {
        // Crear/verificar las tablas
        await createTables();

        // Esperar a que la conexión y suscripción MQTT se completen
        await connectAndSubscribe();

        // Manejar los mensajes recibidos
        client.on('message', async (topic, message) => {
            console.log(`Mensaje recibido en el canal ${topic}:`);
            try {
                const data = JSON.parse(message.toString());
                console.log('Contenido del mensaje:', data);
        
                // Aquí puedes insertar los datos en la base de datos
            } catch (error) {
                console.error('Error al procesar el mensaje:', error);
            }
        });

        console.log("Aplicación en ejecución, esperando mensajes...");

    } catch (error) {
        console.error('Error en la aplicación:', error);
    }

    console.log("salio");
}

startApplication();
