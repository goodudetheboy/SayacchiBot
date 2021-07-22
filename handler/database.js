const mongoose = require('mongoose');
const MONGODB_SRV = process.env.MONGODB_SRV;
const fs = require('fs');
const modelFolder = fs.readdirSync('./models');

async function initialize(client) {
    console.log('Connecting to MongoDB');
    await mongoose.connect(MONGODB_SRV, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).then(() => {
        console.log('Database connected');
        for (const modelFile of modelFolder) {
            if (modelFile.endsWith('.js')) {
                let databaseFile = modelFile.substring(0, modelFile.length-3);
                console.log(`Initializing '${ databaseFile }' database`);
                const database = require(`../models/${modelFile}`);
                database.setDiscordClient(client);
                module.exports.databases.set(databaseFile, database);
            }
        }
    }).catch(console.error);
}

var databases = new Map();

module.exports = {
    databases,
    initialize
};
