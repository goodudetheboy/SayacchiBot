require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const Utils = require('../utils/utils');

describe('Database test', () => {
    test('Connecting to MongoDB', async () => {
        const db = require('../handler/database');
        await db.testConnection();
    });

    test('Rolling dice game test', async () => {
        const db = require('../handler/database');
        let databases;
        databases = await db.initialize(client);
        expect(databases).toBeDefined();
        const rolldice = require('../commands/game/rolldice');
        rolldice.setDatabases(databases);
        let expected = Utils.randomInteger(1, 100);
        expect(await rolldice.testDatabase(expected)).toBe(expected);
    });
});
