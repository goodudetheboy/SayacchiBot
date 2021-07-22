const mongoose = require('mongoose');
const MONGODB_SRV = process.env.MONGODB_SRV;
const fs = require('fs');
const modelFolder = fs.readdirSync('./models');

module.exports = {
    initialize,
    testConnection,
    disconnect
};

async function initialize(client) {
    console.log('Connecting to MongoDB');
    await connect().catch(error => {
        console.log(`Error connecting to MongoDB: ${ error }`);
    });
    let databases = new Map();
    for (const modelFile of modelFolder) {
        if (modelFile.endsWith('.js')) {
            let databaseFile = modelFile.substring(0, modelFile.length-3);
            console.log(`Initializing '${ databaseFile }' database`);
            const database = require(`../models/${modelFile}`);
            database.setDiscordClient(client);
            databases.set(databaseFile, database);
        }
    }
    return databases;
}

async function connect() {
    console.log('Connecting to database');
    await mongoose.connect(MONGODB_SRV, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });
    console.log('Database connected');
}

function disconnect() {
    console.log('Disconnecting from database');
    mongoose.connection.close();
    console.log('Database disconnected');
}

async function testConnection() {
    let success = false;
    await connect()
    .then(() => {
        disconnect()
        success = true
    }).catch(error => {
        console.log(`Error connecting to MongoDB: ${ error }`)
        });
    return success;
}


