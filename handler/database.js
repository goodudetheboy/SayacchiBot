const mongoose = require('mongoose');
const { MONGODB_SRV } = require('../config.json');
const fs = require('fs');
const modelFolder = fs.readdirSync('./models');

async function initialize() {
    console.log('Connecting to MongoDB');
    await mongoose.connect(MONGODB_SRV, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).then(() => {
        console.log('Database connected');
        for (const modelFile of modelFolder) {
            if (modelFile.endsWith('.js')) {
                console.log(`Initializing '${ modelFile }' database`);
                const database = require(`../models/${modelFile}`);
            }
        }
    }).catch(console.error);
}

module.exports = {
    initialize
};
