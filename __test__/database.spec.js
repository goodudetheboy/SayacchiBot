require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const Utils = require('../utils/utils');

describe('Database test', () => {
    test('Connecting to MongoDB', async () => {
        const db = require('../handler/database');
        expect(await db.testConnection()).toBe(true);
    });

    test('Rolling dice game test', async () => {
        // setup database
        const db = require('../handler/database');
        let databases;
        databases = await db.initialize(client);
        expect(databases).toBeDefined();

        // add database to command
        const rolldice = require('../commands/game/rolldice');
        rolldice.setDatabases(databases);
        let expected = Utils.randomInteger(1, 100);

        // run test
        expect(await rolldice.testDatabase(expected)).toBe(expected);

        // TODO: refactor test cleanup
        testCleanup(db);
    });
})

function testCleanup(db) {
    db.disconnect();
    client.destroy();
}