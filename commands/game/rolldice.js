const MessageButton = require('discord-buttons').MessageButton;
const MessageActionRow = require('discord-buttons').MessageActionRow;

module.exports = {
    name: 'rolldice',
    description: 'Play a Cho-han, a.k.a. odd-or-even game with Sayacchi! Guess the correct odd or even of the Lucky Number (ラッキーナンバー）, which is the sum of 2 dice, and win a special prize! Higher win streak wins more special prize! Check current win streak with `rolldice streak`.',
    args: false,
    aliases: [ 'chohan' ],
    async execute(message, args) {
        if (args.length == 0) {
            startGame(message); 
        }

        switch (args[0]) {
            case "streak":
                return sendCurrentStreak(message);
            case "highscore":
                return sendHighscore(message);
            case "leaderboard":
                if (args[1] == 'refresh') {
                    message.channel.send('Refreshing rolldice leaderboard...');
                    await refreshLeaderboard();
                    message.channel.send('Rolldice leaderboard refreshed!');
                    message.channel.send('Here\'s your fresh new leaderboard!');
                }
                return sendLeaderboard(message);
        }
    },
    check,
    setDatabases
}

var RollDiceDB;
var UserDB;
function setDatabases(databases) {
    RollDiceDB = databases.get('rolldice-db').RollDiceDB;
    UserDB = databases.get('user').User;
    console.log(`Databases initialized in ${ module.exports.name } succesfully`);
}

//-----------------------------------------------------------------------------

var leaderboard;
const MAX_LEADERBOARD_PLAYER = 5;

//-----------------------------------------------------------------------------

function startGame(message) {
    let userId = message.author.id;

    let evenButton = new MessageButton()
                        .setLabel("Even 丁")
                        .setStyle("red")
                        .setID(`rolldice_${userId}_even`)

    let oddButton = new MessageButton()
                        .setLabel("Odd 半")
                        .setStyle("green")
                        .setID(`rolldice_${userId}_odd`)

    let buttonRow = new MessageActionRow()
                        .addComponent(evenButton)
                        .addComponent(oddButton);

    message.channel.send("Let's play the rolling dice game! Guess even or odd of sum of the two dice!");
    message.channel.send("ゲームスタート！", { component: buttonRow });
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function check(client, button, userId, answer) {
    button.message.channel.send("Rolling dice... 🎲🎲");
    button.message.delete();
    setTimeout(async function() {
        let user = `<@${ userId }>`;

        console.log('Rolling dice');
        let die1 = randomInteger(1, 6);
        let die2 = randomInteger(1, 6);
        let sum = die1 + die2;
        let isOdd = sum % 2 != 0;
        let youWinCheck;
    
        if (answer == "odd") {
            youWinCheck = isOdd;
        } else if (answer == "even") {
            youWinCheck = !isOdd;
        } else {
            Error.sendErrorCode(button.message, 2);
        }
    
        button.message.channel.send(`Die 1 is ${ numberToEmoji(die1) }`);
        button.message.channel.send(`Die 2 is ${ numberToEmoji(die2) }`);
        button.message.channel.send(`${ user }, you chose ${ answer }`);
    
        await checkExist(userId);

        if (youWinCheck) {
            await youWin(button.message, client, userId);
        } else {
            await youLose(button.message, userId);
        }
    }, 3000);
}

async function youWin(message, client, userId) {
    message.channel.send("You win!");
    message.channel.send("勝利！☆*:.｡.o(≧▽≦)o.｡.:*☆");

    let player;
    player = await RollDiceDB.findById(userId)
                             .catch(console.error);

    let winStreak = player.currentStreak;
    winStreak = winStreak + 1;
    updateStreak(winStreak, userId);
    if (winStreak > player.highscore) {
        updateHighscore(winStreak, userId);
    }
    
    let prize = client.commands.get('prize');
    prize.imagePrize(message, winStreak);
}

async function youLose(message, userId) {
    message.channel.send("You lose :*(");
    message.channel.send("負けった 	｡･ﾟﾟ*(>д<)*ﾟﾟ･｡");
    updateStreak(0, userId);
}


function updateStreak(streak, userId) {
    RollDiceDB
        .findByIdAndUpdate(userId, { currentStreak: streak })
        .then(() => { console.log(`${ userId } - Streak updated to ${ streak } succesfully`); })
        .catch(console.error);
}

function updateHighscore(highscore, userId) {
    RollDiceDB
        .findByIdAndUpdate(userId, { highscore: highscore })
        .then(() => { console.log(`${ userId } - Highscore updated to ${ highscore } succesfully`); })
        .catch(console.error);
}

async function sendCurrentStreak(message) {
    let userId = message.author.id;
    await checkExist(userId);
    let currentStreak;
    currentStreak = await RollDiceDB.getCurrentStreak(userId);
    return message.channel.send(`<@${userId}>, your current win streak is ${ currentStreak }.`);
}

async function sendHighscore(message) {
    let userId = message.author.id;
    await checkExist(userId);
    let highscore;
    highscore = await RollDiceDB.getHighscore(userId);
    return message.channel.send(`<@${userId}>, your highest streak is ${ highscore }.`);
}

async function sendLeaderboard(message) {
    if (typeof leaderboard === 'undefined') {
        await refreshLeaderboard();
    }
    message.channel.send('Leaderboard for rolldice');
    message.channel.send('RANK - USERNAME - SCORE');
    for(let rank=1; rank <= leaderboard.size; rank++) {
        let player = leaderboard.get(rank);
        message.channel.send(`${rank} - ${player.username} - ${player.score}`);
    } 
}

//TODO: consider putting this in highscore schema
async function refreshLeaderboard() {
    console.log(`Refreshing rolldice leaderboard`);
    let sortedPlayers = await RollDiceDB.find().sort({ highscore: -1, _id: -1 });
    leaderboard = new Map();
    for (let i=0; i < sortedPlayers.length && i < MAX_LEADERBOARD_PLAYER; i++) {
        let player = sortedPlayers[i]._doc;
        let rank = i+1;
        leaderboard.set(rank, {
            username: await UserDB.getNameById(player._id),
            score: player.highscore
        });
    }
    console.log(`Rolldice leaderboard refreshed`);
}

async function addPlayer(userId) {
    const player = new RollDiceDB({ _id: userId });
    await player.save()
                .catch(console.error);
    console.log(`Added player with userId ${ userId } to rolldice database`);
}

async function checkExist(userId) {
    const playerExist = await RollDiceDB.exists({ _id: userId });
    if (!playerExist) {
        await addPlayer(userId);
    }
    UserDB.checkExist(userId);
}

function numberToEmoji(number) {
    switch (number) {
        case 1: return "1️⃣";
        case 2: return "2️⃣";
        case 3: return "3️⃣";
        case 4: return "4️⃣";
        case 5: return "5️⃣";
        case 6: return "6️⃣";
    }
}